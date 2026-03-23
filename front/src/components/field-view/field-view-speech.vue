<script>
export default {
    name: "FieldViewSpeech",
    methods: {
        fieldViewSpeech_onFocus() {
            const that = this;

            const SpeechRecognition =
                window.SpeechRecognition || webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = "fr-FR";
            this.recognition.interimResults = false;
            this.recognition.continous = true;
            this.recognition.maxAlternatives = 1;

            this.recognition.start();
            this.recognition.onresult = (event) => {
                const input = this.$el.querySelector("input, textarea");
                const txtStart =
                    this.value?.substring(0, input.selectionStart) || "";
                const txtEnd = this.value?.substring(input.selectionEnd) || "";

                let txtSpeech = event.results[0][0].transcript;
                if (txtSpeech == "virgule") {
                    txtSpeech = ",";
                } else if (txtSpeech == "point") {
                    txtSpeech = ".";
                } else if (txtSpeech == "point-virgule") {
                    txtSpeech = " ;";
                } else if (txtSpeech == "point d'interrogation") {
                    txtSpeech = " ?";
                } else if (txtSpeech == "point d'exclamation") {
                    txtSpeech = " !";
                } else if (txtSpeech == "à la ligne") {
                    txtSpeech = "\r\n";
                } else if (txtSpeech == "espace") {
                    txtSpeech = " ";
                } else {
                    if (txtStart == txtStart.trimEnd()) {
                        txtSpeech = ` ${txtSpeech}`;
                    }
                    if (txtEnd == txtEnd.trimStart()) {
                        txtSpeech = `${txtSpeech} `;
                    }
                }

                this.value = `${txtStart}${txtSpeech}${txtEnd}`;
                that.fieldViewData_onInput();
                this.$nextTick(() => {
                    input.selectionStart = txtStart.length + txtSpeech.length;
                    input.selectionEnd = input.selectionStart;
                });
            };
            this.recognition.onend = () => {
                // const synth = window.speechSynthesis;
                // const utterThis = new SpeechSynthesisUtterance(this.value);
                // synth.speak(utterThis);
                if (this.recognition) {
                    that.recognition.start();
                }
            };
        },
        fieldViewSpeech_onBlur() {
            this.recognition.stop();
            this.recognition = null;
        },
    },
};
</script>
