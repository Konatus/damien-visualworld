<script>
import {
    Bar,
    Bubble,
    Doughnut,
    HorizontalBar,
    Line,
    Pie,
    PolarArea,
    Radar,
    Scatter,
} from "vue-chartjs";
import isEqual from "lodash.isequal";

export default {
    mixins: [Bar], // Necessary for props management, but render function will be overwrite at mount by the appropriate one
    props: {
        type: {
            type: String,
            default: () => "line",
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: Object,
            default: () => {},
        },
    },
    mounted() {
        const chart = {
            bar: Bar,
            bubble: Bubble,
            doughnut: Doughnut,
            "horizontal-bar": HorizontalBar,
            line: Line,
            pie: Pie,
            "polar-area": PolarArea,
            radar: Radar,
            scatter: Scatter,
        }[this.type];
        chart.options.animation = false;
        this.renderChart = chart.options.methods.renderChart;
        this.rerender();
    },
    watch: {
        type(newV, oldV) {
            if (!isEqual(newV, oldV)) {
                this.rerender();
            }
        },
        options(newV, oldV) {
            if (!isEqual(newV, oldV)) {
                this.rerender();
            }
        },
        data(newV, oldV) {
            if (!isEqual(newV, oldV)) {
                this.rerender();
            }
        },
    },
    methods: {
        rerender() {
            this.renderChart(
                {
                    ...this.data,
                },
                {
                    ...this.options,
                    animation: false,
                    responsive: true,
                    maintainAspectRatio: false,
                }
            );
        },
    },
};
</script>
