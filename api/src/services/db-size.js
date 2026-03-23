// TODO : https://docs.mongodb.com/manual/reference/command/dbStats/
export default async ({ document, scale }) => {
  function round(number) {
    number = Math.round((number * 10) / 10).toFixed(1);
    return parseFloat(number); // prevent toFixed() from returning string
  }

  const out = [];
  for (let world of document) {
    const db = global.mgo.db(world.worldId);
    const dbStats = await db.stats();
    out.push({
      totalSize: round(dbStats.totalSize / scale),
      scale,
    });
  }
  return out;
};
