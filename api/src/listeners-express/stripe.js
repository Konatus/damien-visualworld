import Express from "express";
import worldAlive from "../controllers/world-alive/index.js";
import list from "../services/list.js";
import translate from "../utils/translate.js";
import log from "../utils/log.js";
import products from "../product.js";
import CONF from "../conf.js";
import StripeModule from "stripe";
const stripe = StripeModule(CONF.STRIPE_KEY);
const worldOwner = async (event, id) => {
  const world =
    (await list.alive({
      database: "worlds",
      collection: "Data",
    })) || [];

  return world.filter((item) => item.private[`stripe${event}Id`] === id);
};

export default async (express) => {
  const endpointSecret = CONF.STRIPE_WH_SECRET;

  express.post(
    "/api/webhook",
    Express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      let event, customerSubscription, worldData;
      let document = [];

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        customerSubscription = event.data.object;
        worldData = await worldOwner("Subscription", customerSubscription.id);
      } catch (err) {
        log.errorStripe(err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
      log.stripe("Webhook", event.type);

      // Handle the event
      try {
        switch (event.type) {
          case "customer.subscription.created": {
            const customer = await stripe.customers.retrieve(
              customerSubscription.customer
            );
            const [data] = customerSubscription.items.data;
            const $t = translate(req);

            document = [
              {
                data: {
                  name: $t.__("world.name"),
                  team: "",
                  rootable: true,
                },
                private: {
                  ...products[data.plan.product],
                  stripeSubscriptionId: customerSubscription.id,
                  stripeCustomerId: customerSubscription.customer,
                },
                createdBy: customer.email, // TODO: we should know when a world is created through Stripe
              },
            ];
            await worldAlive.create(
              req,
              {},
              { document, email: customer.email }
            );
            break;
          }
          case "customer.subscription.updated": {
            const dateNow = new Date(customerSubscription.cancel_at);
            const expiredAt = customerSubscription.cancel_at
              ? dateNow.toISOString()
              : null;

            await worldAlive.update(
              req,
              {},
              {
                document: worldData.map((item) => ({
                  _id: item.worldId,
                  private: { expiredAt },
                })),
              }
            );
            break;
          }
          case "customer.subscription.deleted": {
            await worldAlive.remove(
              req,
              {},
              { document: worldData.map((item) => ({ _id: item.worldId })) }
            );
            log.stripe(
              "Subscription deleted",
              worldData.map((item) => item.worldId)
            );
            break;
          }
          case "customer.updated": {
            const email = customerSubscription.email;
            const worlds = await worldOwner(
              "Customer",
              customerSubscription.id
            );
            worlds.forEach((world) => {
              if (world && world.data.owner !== email) {
                document.push({ _id: world.worldId, data: { owner: email } });
              }
            });
            await worldAlive.update(req, { stripe: true }, { document });
            break;
          }
          case "subscription_schedule.canceled": {
            break;
            // ... handle other event types
          }
          default:
          //log.stripe('Unhandled event type', event.type)
        }

        // Return a 200 res to acknowledge receipt of the event
        res.send();
      } catch (error) {
        log.errorStripe(error);
      }
    }
  );

  express.delete("/api/webhook", async (req, res) => {
    try {
      const dateNow = new Date();

      const worlds =
        (await list.alive({
          database: "worlds",
          collection: "Data",
        })) || [];
      const document = worlds
        .filter((world) => {
          if (world.private.expiredAt) {
            const expiredDate = new Date(world.private.expiredAt);
            return dateNow.getTime() > expiredDate.getTime();
          }
        })
        .map((item) => ({ _id: item.worldId }));

      await worldAlive.remove(req, { stripe: true }, { document });

      res.status(200).send({ deletedWorlds: document.map((item) => item._id) });
    } catch (error) {
      log.error(`Delete the expired world subscription: ${error}`);
      res.status(400).send("Error: Delete the expired world subscription");
    }
  });
};
