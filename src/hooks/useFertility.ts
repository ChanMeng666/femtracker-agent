import { useState } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { 
  cervicalMucusTypes, 
  ovulationTestResults, 
  VALID_CERVICAL_MUCUS_TYPES, 
  VALID_OVULATION_TEST_RESULTS,
  sampleFertilityData,
  BBT_MIN,
  BBT_MAX
} from "@/constants/fertility";

export function useFertility() {
  const [bbt, setBbt] = useState<string>("");
  const [cervicalMucus, setCervicalMucus] = useState<string>("");
  const [ovulationTest, setOvulationTest] = useState<string>("");

  const currentBBT = bbt || sampleFertilityData.currentBBT;

  // Make fertility data readable by AI
  useCopilotReadable({
    description: "Current fertility tracking data and status",
    value: {
      bbt: currentBBT,
      cervicalMucus,
      ovulationTest,
      fertilityScore: sampleFertilityData.fertilityScore,
      expectedOvulation: sampleFertilityData.expectedOvulation,
      conceptionProbability: sampleFertilityData.conceptionProbability,
      cervicalMucusTypes: cervicalMucusTypes.map(cm => ({
        value: cm.value,
        label: cm.label,
        selected: cervicalMucus === cm.value
      })),
      ovulationTestResults: ovulationTestResults.map(ot => ({
        value: ot.value,
        label: ot.label,
        selected: ovulationTest === ot.value
      }))
    }
  });

  // AI Action: Record BBT
  useCopilotAction({
    name: "recordBBT",
    description: "Record basal body temperature",
    parameters: [{
      name: "temperature",
      type: "number",
      description: `Body temperature in Celsius (${BBT_MIN}-${BBT_MAX})`,
      required: true,
    }],
    handler: ({ temperature }) => {
      if (temperature >= BBT_MIN && temperature <= BBT_MAX) {
        setBbt(temperature.toFixed(1));
      }
    },
  });

  // AI Action: Set cervical mucus
  useCopilotAction({
    name: "setCervicalMucus",
    description: "Record cervical mucus type",
    parameters: [{
      name: "mucusType",
      type: "string",
      description: "Cervical mucus type (dry, sticky, creamy, watery, egg_white)",
      required: true,
    }],
    handler: ({ mucusType }) => {
      if (VALID_CERVICAL_MUCUS_TYPES.includes(mucusType)) {
        setCervicalMucus(mucusType);
      }
    },
  });

  // AI Action: Set ovulation test result
  useCopilotAction({
    name: "setOvulationTest",
    description: "Record ovulation test result",
    parameters: [{
      name: "testResult",
      type: "string",
      description: "Ovulation test result (negative, low, positive)",
      required: true,
    }],
    handler: ({ testResult }) => {
      if (VALID_OVULATION_TEST_RESULTS.includes(testResult)) {
        setOvulationTest(testResult);
      }
    },
  });

  // AI Action: Clear fertility data
  useCopilotAction({
    name: "clearFertilityData",
    description: "Clear all fertility tracking data",
    parameters: [],
    handler: () => {
      setBbt("");
      setCervicalMucus("");
      setOvulationTest("");
    },
  });

  return {
    bbt,
    setBbt,
    cervicalMucus,
    setCervicalMucus,
    ovulationTest,
    setOvulationTest,
    currentBBT,
    fertilityScore: sampleFertilityData.fertilityScore,
    expectedOvulation: sampleFertilityData.expectedOvulation,
    conceptionProbability: sampleFertilityData.conceptionProbability
  };
} 