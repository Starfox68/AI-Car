class Level {
  constructor(numInput, numOutput) {
    //for creation
    this.biases = new Array(numOutput);
    this.inputs = new Array(numInput);
    this.outputs = new Array(numOutput);
    this.weights = [];

    for (let i = 0; i < numInput; i++) {
      this.weights[i] = new Array(numOutput);
    }
    //each level starts off randomized
    Level.#randomize(this);
  }

  static transformInputs(inputsGiven, level) {
    //copy given inputs to level inputs
    for (let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = inputsGiven[i];
    }

    //sum all the inputs accounting for weight
    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0;
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }
      //if sum > bias - turn on the "neuron"
      if (sum > level.biases[i]) {
        level.outputs[i] = 1;
      } else {
        //leave it off
        level.outputs[i] = 0;
      }
    }

    return level.outputs;
  }

  static #randomize(lev) {
    //assign a random weight to each connection
    for (let i = 0; i < lev.inputs.length; i++) {
      for (let j = 0; j < lev.outputs.length; j++) {
        lev.weights[i][j] = Math.random() * 2 - 1;
      }
    }
    //assign a random bias to each connection
    for (let i = 0; i < lev.biases.length; i++) {
      lev.biases[i] = Math.random() * 2 - 1;
    }
  }
}

class NeuralNetwork {
  constructor(numNeurons) {
    //internal info
    this.levels = [];

    //add all levels to array
    for (let i = 0; i < numNeurons.length - 1; i++) {
      let tempLevel = new Level(numNeurons[i], numNeurons[i + 1]);
      this.levels.push(tempLevel);
    }
  }

  static adapt(nNetwork, bias = 0.1) {
    //go through each level and randomly adjust by the bias
    nNetwork.levels.forEach((lev) => {
      for (let i = 0; i < lev.biases.length; i++) {
        let newBias = linExtrap(lev.biases[i], Math.random() * 2 - 1, bias);
        lev.biases[i] = newBias;
      }
      //within each level randomly adjust the weights by the bias
      for (let i = 0; i < lev.weights.length; i++) {
        for (let j = 0; j < lev.weights[i].length; j++) {
          let newWeight = linExtrap(
            lev.weights[i][j],
            Math.random() * 2 - 1,
            bias
          );
          lev.weights[i][j] = newWeight;
        }
      }
    });
  }

  //link each input given to the output for the next level
  static transformInputs(inputsGiven, nNetwork) {
    let output = Level.transformInputs(inputsGiven, nNetwork.levels[0]);
    for (let i = 1; i < nNetwork.levels.length; i++) {
      output = Level.transformInputs(output, nNetwork.levels[i]);
    }
    return output;
  }
}
