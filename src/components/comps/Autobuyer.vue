<template>
    <div class="autobuyer">
        <h3>{{ autobuyerName }} Autobuyer</h3>
        <p>Interval: {{ interval }}</p>
        <p>Auto: {{ auto }}</p>
        <button @click="toggleAuto" :style="autoStyle">{{ auto === 'ON' ? 'Turn Off' : 'Turn On' }}</button>
        <button @click="toggleMode" :style="modeStyle">{{ autobuyerMode }}</button>

        <!-- Render input field if the autobuyer type is "Prestiger" -->
        <div v-if="autobuyerType === 'Prestiger'" class="prestiger-input">
            <label for="prestige-amount">{{ prestigerLabel }}</label>
            <input id="prestige-amount" type="text" @change="updateAmount" :placeholder="prestigerPlaceholder"
                v-model="inputValue" />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        autobuyer: Object,
        playerAutobuyer: Object
    },
    data() {
        return {
            inputValue: "" // Bind this to the input field
        };
    },
    computed: {
        autobuyerName() {
            return this.autobuyer.name;
        },
        interval() {
            return formatTime(this.autobuyer.autobuyer.interval());
        },
        auto() {
            return this.playerAutobuyer.isOn ? "ON" : "OFF";
        },
        autobuyerType() {
            return this.autobuyer.autobuyer.type;
        },
        autobuyerMode() {
            return this.playerAutobuyer.autobuyerMode;
        },
        autoStyle() {
            return {
                backgroundColor: this.playerAutobuyer.isOn ? "#e11d48" : "#10b981"
            };
        },
        modeStyle() {
            return {
                backgroundColor: this.autobuyerMode === "SINGLE" ? "#e11d48" : "#10b981"
            };
        },
        prestigerLabel() {
            return this.autobuyerMode === "AMOUNT" ? "Prestige Amount:" : "Prestige Time (Seconds):";
        },
        prestigerPlaceholder() {
            return this.autobuyerMode === "AMOUNT"
                ? "Enter prestige amount"
                : "Enter prestige time";
        }
    },
    mounted() {
        // Initialize inputValue with the formatted playerAutobuyer.amount
        this.formatInput();
    },
    methods: {
        toggleAuto() {
            // Toggle the auto property to turn the autobuyer on/off
            this.playerAutobuyer.toggle(player);
        },
        toggleMode() {
            // Toggle the autobuyer mode
            this.playerAutobuyer.toggleMode(player);
            this.formatInput()
        },
        updateAmount(event) {
            // Get the input value
            const inputValue = event.target.value;

            // Convert it to a number
            const parsedValue = new Decimal(inputValue);
            // Check if it's a valid number
            if (parsedValue.gte(0)) {
                this.playerAutobuyer.updateAmount(player, parsedValue); // Update the playerAutobuyer object
            } else {
                this.playerAutobuyer.updateAmount(player, Decimal.dZero); // Optionally, reset to zero
            }
            this.formatInput(); // Reformat input value
        },
        formatInput() {
            // Ensure the input value is properly formatted based on playerAutobuyer.amount
            if (this.playerAutobuyer.amount) {
                if (this.autobuyerMode === "AMOUNT") {
                    this.inputValue = formatWhole(this.playerAutobuyer.amount); // Assuming formatWhole is a utility function
                }
                else {
                    this.inputValue = formatTime(this.playerAutobuyer.amount);
                }
            } else {
                this.inputValue = "";
            }
        }
    }
};
</script>

<style scoped>
.autobuyer {
    padding: 10px;
    border: 1px solid #ccc;
    width: 300px;
    border-radius: 10px;
    margin: 10px;
}

button {
    padding: 5px 10px;
    cursor: pointer;
    color: white;
    border: none;
    margin-top: 10px;
}

button:hover {
    opacity: 0.9;
}

.prestiger-input {
    margin-top: 10px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input[type="number"] {
    width: 100%;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
}
</style>
