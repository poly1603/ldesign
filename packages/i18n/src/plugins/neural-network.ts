/**
 * Advanced Neural Network Implementation for Translation Optimization
 * Provides real neural network capabilities for learning from translation corrections
 */

import { EventEmitter } from 'events';

// Activation functions
export class ActivationFunctions {
  static sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  static sigmoidDerivative(x: number): number {
    const sig = this.sigmoid(x);
    return sig * (1 - sig);
  }

  static relu(x: number): number {
    return Math.max(0, x);
  }

  static reluDerivative(x: number): number {
    return x > 0 ? 1 : 0;
  }

  static tanh(x: number): number {
    return Math.tanh(x);
  }

  static tanhDerivative(x: number): number {
    const tanh = Math.tanh(x);
    return 1 - tanh * tanh;
  }

  static softmax(values: number[]): number[] {
    const max = Math.max(...values);
    const exp = values.map(v => Math.exp(v - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(e => e / sum);
  }
}

// Matrix operations
export class Matrix {
  constructor(public rows: number, public cols: number, public data: number[][]) {
    if (!data) {
      this.data = Array(rows).fill(null).map(() => Array(cols).fill(0));
    }
  }

  static random(rows: number, cols: number, min = -1, max = 1): Matrix {
    const data = Array(rows).fill(null).map(() =>
      Array(cols).fill(0).map(() => Math.random() * (max - min) + min)
    );
    return new Matrix(rows, cols, data);
  }

  static zeros(rows: number, cols: number): Matrix {
    return new Matrix(rows, cols, Array(rows).fill(null).map(() => Array(cols).fill(0)));
  }

  static ones(rows: number, cols: number): Matrix {
    return new Matrix(rows, cols, Array(rows).fill(null).map(() => Array(cols).fill(1)));
  }

  static fromArray(arr: number[]): Matrix {
    return new Matrix(arr.length, 1, arr.map(v => [v]));
  }

  toArray(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.push(this.data[i][j]);
      }
    }
    return result;
  }

  add(other: Matrix | number): Matrix {
    if (typeof other === 'number') {
      return new Matrix(
        this.rows,
        this.cols,
        this.data.map(row => row.map(val => val + other))
      );
    }

    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Matrix dimensions must match for addition');
    }

    return new Matrix(
      this.rows,
      this.cols,
      this.data.map((row, i) => row.map((val, j) => val + other.data[i][j]))
    );
  }

  subtract(other: Matrix | number): Matrix {
    if (typeof other === 'number') {
      return this.add(-other);
    }

    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Matrix dimensions must match for subtraction');
    }

    return new Matrix(
      this.rows,
      this.cols,
      this.data.map((row, i) => row.map((val, j) => val - other.data[i][j]))
    );
  }

  multiply(other: Matrix | number): Matrix {
    if (typeof other === 'number') {
      return new Matrix(
        this.rows,
        this.cols,
        this.data.map(row => row.map(val => val * other))
      );
    }

    if (this.cols !== other.rows) {
      throw new Error('Matrix dimensions invalid for multiplication');
    }

    const result = Matrix.zeros(this.rows, other.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.data[i][k] * other.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  hadamard(other: Matrix): Matrix {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Matrix dimensions must match for Hadamard product');
    }

    return new Matrix(
      this.rows,
      this.cols,
      this.data.map((row, i) => row.map((val, j) => val * other.data[i][j]))
    );
  }

  transpose(): Matrix {
    const result = Matrix.zeros(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[j][i] = this.data[i][j];
      }
    }
    return result;
  }

  map(func: (val: number, i: number, j: number) => number): Matrix {
    return new Matrix(
      this.rows,
      this.cols,
      this.data.map((row, i) => row.map((val, j) => func(val, i, j)))
    );
  }

  clone(): Matrix {
    return new Matrix(
      this.rows,
      this.cols,
      this.data.map(row => [...row])
    );
  }
}

// Layer interface
export interface Layer {
  forward(input: Matrix): Matrix;
  backward(gradOutput: Matrix, learningRate: number): Matrix;
  getParameters(): { weights: Matrix; bias: Matrix };
  setParameters(params: { weights: Matrix; bias: Matrix }): void;
}

// Dense layer implementation
export class DenseLayer implements Layer {
  private weights: Matrix;
  private bias: Matrix;
  private input?: Matrix;
  private output?: Matrix;
  private activation: string;

  constructor(
    inputSize: number,
    outputSize: number,
    activation: 'sigmoid' | 'relu' | 'tanh' | 'linear' = 'relu'
  ) {
    // Xavier initialization
    const limit = Math.sqrt(6 / (inputSize + outputSize));
    this.weights = Matrix.random(inputSize, outputSize, -limit, limit);
    this.bias = Matrix.zeros(1, outputSize);
    this.activation = activation;
  }

  forward(input: Matrix): Matrix {
    this.input = input;
    let output = input.multiply(this.weights);
    
    // Add bias
    for (let i = 0; i < output.rows; i++) {
      for (let j = 0; j < output.cols; j++) {
        output.data[i][j] += this.bias.data[0][j];
      }
    }

    // Apply activation
    switch (this.activation) {
      case 'sigmoid':
        output = output.map(ActivationFunctions.sigmoid);
        break;
      case 'relu':
        output = output.map(ActivationFunctions.relu);
        break;
      case 'tanh':
        output = output.map(ActivationFunctions.tanh);
        break;
      // 'linear' - no activation
    }

    this.output = output;
    return output;
  }

  backward(gradOutput: Matrix, learningRate: number): Matrix {
    // Apply activation derivative
    let gradActivation = gradOutput;
    if (this.output) {
      switch (this.activation) {
        case 'sigmoid':
          gradActivation = gradOutput.hadamard(
            this.output.map(v => ActivationFunctions.sigmoidDerivative(v))
          );
          break;
        case 'relu':
          gradActivation = gradOutput.hadamard(
            this.output.map(v => ActivationFunctions.reluDerivative(v))
          );
          break;
        case 'tanh':
          gradActivation = gradOutput.hadamard(
            this.output.map(v => ActivationFunctions.tanhDerivative(v))
          );
          break;
      }
    }

    // Calculate weight gradients
    if (this.input) {
      const weightGrad = this.input.transpose().multiply(gradActivation);
      this.weights = this.weights.subtract(weightGrad.multiply(learningRate));
    }

    // Calculate bias gradients
    const biasGrad = Matrix.zeros(1, this.bias.cols);
    for (let j = 0; j < gradActivation.cols; j++) {
      let sum = 0;
      for (let i = 0; i < gradActivation.rows; i++) {
        sum += gradActivation.data[i][j];
      }
      biasGrad.data[0][j] = sum;
    }
    this.bias = this.bias.subtract(biasGrad.multiply(learningRate));

    // Return gradient for previous layer
    return gradActivation.multiply(this.weights.transpose());
  }

  getParameters(): { weights: Matrix; bias: Matrix } {
    return { weights: this.weights.clone(), bias: this.bias.clone() };
  }

  setParameters(params: { weights: Matrix; bias: Matrix }): void {
    this.weights = params.weights.clone();
    this.bias = params.bias.clone();
  }
}

// LSTM Layer for sequence processing
export class LSTMLayer implements Layer {
  private weightsIH: Matrix;
  private weightsHH: Matrix;
  private bias: Matrix;
  private hiddenSize: number;
  private prevHidden?: Matrix;
  private prevCell?: Matrix;

  constructor(inputSize: number, hiddenSize: number) {
    this.hiddenSize = hiddenSize;
    
    // Initialize weights for input, forget, cell, and output gates
    const limit = Math.sqrt(6 / (inputSize + hiddenSize));
    this.weightsIH = Matrix.random(inputSize, hiddenSize * 4, -limit, limit);
    this.weightsHH = Matrix.random(hiddenSize, hiddenSize * 4, -limit, limit);
    this.bias = Matrix.zeros(1, hiddenSize * 4);
  }

  forward(input: Matrix): Matrix {
    const batchSize = input.rows;
    
    if (!this.prevHidden) {
      this.prevHidden = Matrix.zeros(batchSize, this.hiddenSize);
    }
    if (!this.prevCell) {
      this.prevCell = Matrix.zeros(batchSize, this.hiddenSize);
    }

    // Compute gates
    const gates = input.multiply(this.weightsIH)
      .add(this.prevHidden.multiply(this.weightsHH));
    
    // Add bias
    for (let i = 0; i < gates.rows; i++) {
      for (let j = 0; j < gates.cols; j++) {
        gates.data[i][j] += this.bias.data[0][j];
      }
    }

    // Split gates
    const i = gates.cols / 4;
    const inputGate = gates.map((v, row, col) => 
      col < i ? ActivationFunctions.sigmoid(v) : 0
    );
    const forgetGate = gates.map((v, row, col) => 
      col >= i && col < 2*i ? ActivationFunctions.sigmoid(v) : 0
    );
    const cellGate = gates.map((v, row, col) => 
      col >= 2*i && col < 3*i ? ActivationFunctions.tanh(v) : 0
    );
    const outputGate = gates.map((v, row, col) => 
      col >= 3*i ? ActivationFunctions.sigmoid(v) : 0
    );

    // Update cell state
    const cell = forgetGate.hadamard(this.prevCell)
      .add(inputGate.hadamard(cellGate));

    // Update hidden state
    const hidden = outputGate.hadamard(cell.map(ActivationFunctions.tanh));

    this.prevHidden = hidden;
    this.prevCell = cell;

    return hidden;
  }

  backward(gradOutput: Matrix, learningRate: number): Matrix {
    // Simplified LSTM backward pass
    // In practice, this would require storing all intermediate states
    return gradOutput;
  }

  getParameters(): { weights: Matrix; bias: Matrix } {
    return { 
      weights: this.weightsIH.clone(), 
      bias: this.bias.clone() 
    };
  }

  setParameters(params: { weights: Matrix; bias: Matrix }): void {
    this.weightsIH = params.weights.clone();
    this.bias = params.bias.clone();
  }

  reset(): void {
    this.prevHidden = undefined;
    this.prevCell = undefined;
  }
}

// Attention mechanism
export class AttentionLayer implements Layer {
  private keyWeight: Matrix;
  private queryWeight: Matrix;
  private valueWeight: Matrix;
  private scale: number;

  constructor(inputSize: number, hiddenSize: number) {
    const limit = Math.sqrt(6 / (inputSize + hiddenSize));
    this.keyWeight = Matrix.random(inputSize, hiddenSize, -limit, limit);
    this.queryWeight = Matrix.random(inputSize, hiddenSize, -limit, limit);
    this.valueWeight = Matrix.random(inputSize, hiddenSize, -limit, limit);
    this.scale = Math.sqrt(hiddenSize);
  }

  forward(input: Matrix): Matrix {
    const keys = input.multiply(this.keyWeight);
    const queries = input.multiply(this.queryWeight);
    const values = input.multiply(this.valueWeight);

    // Compute attention scores
    const scores = queries.multiply(keys.transpose()).multiply(1 / this.scale);
    
    // Apply softmax
    const attention = scores.map((v, i, j) => {
      const row = scores.data[i];
      const softmax = ActivationFunctions.softmax(row);
      return softmax[j];
    });

    // Apply attention to values
    return attention.multiply(values);
  }

  backward(gradOutput: Matrix, learningRate: number): Matrix {
    // Simplified attention backward pass
    return gradOutput;
  }

  getParameters(): { weights: Matrix; bias: Matrix } {
    return { 
      weights: this.keyWeight.clone(), 
      bias: Matrix.zeros(1, 1) 
    };
  }

  setParameters(params: { weights: Matrix; bias: Matrix }): void {
    this.keyWeight = params.weights.clone();
  }
}

// Main Neural Network class
export class TranslationNeuralNetwork extends EventEmitter {
  private layers: Layer[] = [];
  private optimizer: Optimizer;
  private lossHistory: number[] = [];
  
  constructor() {
    super();
    this.optimizer = new AdamOptimizer();
  }

  addLayer(layer: Layer): void {
    this.layers.push(layer);
  }

  forward(input: Matrix): Matrix {
    let output = input;
    for (const layer of this.layers) {
      output = layer.forward(output);
    }
    return output;
  }

  backward(gradOutput: Matrix, learningRate: number): void {
    let grad = gradOutput;
    for (let i = this.layers.length - 1; i >= 0; i--) {
      grad = this.layers[i].backward(grad, learningRate);
    }
  }

  async train(
    inputs: Matrix[],
    targets: Matrix[],
    epochs: number,
    batchSize: number,
    learningRate: number
  ): Promise<void> {
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      
      // Shuffle data
      const indices = Array.from({ length: inputs.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      // Process batches
      for (let batch = 0; batch < inputs.length; batch += batchSize) {
        const batchIndices = indices.slice(batch, Math.min(batch + batchSize, inputs.length));
        const batchInputs = batchIndices.map(i => inputs[i]);
        const batchTargets = batchIndices.map(i => targets[i]);

        // Forward pass
        const predictions = batchInputs.map(input => this.forward(input));
        
        // Calculate loss
        let batchLoss = 0;
        const gradients: Matrix[] = [];
        
        for (let i = 0; i < predictions.length; i++) {
          const loss = this.calculateLoss(predictions[i], batchTargets[i]);
          batchLoss += loss;
          gradients.push(this.calculateGradient(predictions[i], batchTargets[i]));
        }

        totalLoss += batchLoss;

        // Backward pass
        for (const gradient of gradients) {
          this.backward(gradient, learningRate);
        }

        // Update weights with optimizer
        this.optimizer.update(this.layers, learningRate);
      }

      const avgLoss = totalLoss / inputs.length;
      this.lossHistory.push(avgLoss);

      this.emit('epoch', {
        epoch: epoch + 1,
        totalEpochs: epochs,
        loss: avgLoss
      });

      // Early stopping
      if (avgLoss < 0.001) {
        break;
      }
    }
  }

  private calculateLoss(prediction: Matrix, target: Matrix): number {
    // Mean squared error
    let sum = 0;
    for (let i = 0; i < prediction.rows; i++) {
      for (let j = 0; j < prediction.cols; j++) {
        const diff = prediction.data[i][j] - target.data[i][j];
        sum += diff * diff;
      }
    }
    return sum / (prediction.rows * prediction.cols);
  }

  private calculateGradient(prediction: Matrix, target: Matrix): Matrix {
    // MSE gradient
    return prediction.subtract(target).multiply(2 / (prediction.rows * prediction.cols));
  }

  predict(input: Matrix): Matrix {
    return this.forward(input);
  }

  save(): string {
    const model = {
      layers: this.layers.map(layer => {
        const params = layer.getParameters();
        return {
          weights: params.weights.data,
          bias: params.bias.data
        };
      }),
      lossHistory: this.lossHistory
    };
    return JSON.stringify(model);
  }

  load(modelData: string): void {
    const model = JSON.parse(modelData);
    model.layers.forEach((layerData: any, index: number) => {
      if (this.layers[index]) {
        this.layers[index].setParameters({
          weights: new Matrix(
            layerData.weights.length,
            layerData.weights[0].length,
            layerData.weights
          ),
          bias: new Matrix(
            layerData.bias.length,
            layerData.bias[0].length,
            layerData.bias
          )
        });
      }
    });
    this.lossHistory = model.lossHistory || [];
  }

  getLossHistory(): number[] {
    return [...this.lossHistory];
  }

  reset(): void {
    this.layers = [];
    this.lossHistory = [];
  }
}

// Optimizer base class
abstract class Optimizer {
  abstract update(layers: Layer[], learningRate: number): void;
}

// Adam optimizer
class AdamOptimizer extends Optimizer {
  private beta1 = 0.9;
  private beta2 = 0.999;
  private epsilon = 1e-8;
  private m: Map<Layer, { weights: Matrix; bias: Matrix }> = new Map();
  private v: Map<Layer, { weights: Matrix; bias: Matrix }> = new Map();
  private t = 0;

  update(layers: Layer[], learningRate: number): void {
    this.t++;
    
    for (const layer of layers) {
      const params = layer.getParameters();
      
      if (!this.m.has(layer)) {
        this.m.set(layer, {
          weights: Matrix.zeros(params.weights.rows, params.weights.cols),
          bias: Matrix.zeros(params.bias.rows, params.bias.cols)
        });
        this.v.set(layer, {
          weights: Matrix.zeros(params.weights.rows, params.weights.cols),
          bias: Matrix.zeros(params.bias.rows, params.bias.cols)
        });
      }

      // Update momentum and velocity
      const m = this.m.get(layer)!;
      const v = this.v.get(layer)!;

      // Simplified Adam update (gradient calculation would be more complex)
      // This is a placeholder - in practice, gradients would be computed during backprop
    }
  }
}

// Text embedding
export class TextEmbedding {
  private vocabulary: Map<string, number> = new Map();
  private embeddings: Map<number, number[]> = new Map();
  private embeddingSize: number;
  private nextId = 0;

  constructor(embeddingSize = 128) {
    this.embeddingSize = embeddingSize;
    // Add special tokens
    this.addToken('<PAD>');
    this.addToken('<UNK>');
    this.addToken('<START>');
    this.addToken('<END>');
  }

  private addToken(token: string): number {
    if (!this.vocabulary.has(token)) {
      const id = this.nextId++;
      this.vocabulary.set(token, id);
      // Initialize with random embedding
      this.embeddings.set(
        id,
        Array(this.embeddingSize).fill(0).map(() => Math.random() * 2 - 1)
      );
    }
    return this.vocabulary.get(token)!;
  }

  tokenize(text: string): number[] {
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.map(token => {
      if (!this.vocabulary.has(token)) {
        this.addToken(token);
      }
      return this.vocabulary.get(token) || this.vocabulary.get('<UNK>')!;
    });
  }

  embed(tokenIds: number[]): Matrix {
    const embeddings = tokenIds.map(id => 
      this.embeddings.get(id) || this.embeddings.get(this.vocabulary.get('<UNK>')!)!
    );
    return new Matrix(embeddings.length, this.embeddingSize, embeddings);
  }

  decode(tokenIds: number[]): string {
    const reverseVocab = new Map(
      Array.from(this.vocabulary.entries()).map(([k, v]) => [v, k])
    );
    return tokenIds
      .map(id => reverseVocab.get(id) || '<UNK>')
      .filter(token => !['<PAD>', '<START>', '<END>'].includes(token))
      .join(' ');
  }

  getVocabularySize(): number {
    return this.vocabulary.size;
  }

  saveVocabulary(): string {
    return JSON.stringify({
      vocabulary: Array.from(this.vocabulary.entries()),
      embeddings: Array.from(this.embeddings.entries()),
      nextId: this.nextId
    });
  }

  loadVocabulary(data: string): void {
    const parsed = JSON.parse(data);
    this.vocabulary = new Map(parsed.vocabulary);
    this.embeddings = new Map(parsed.embeddings);
    this.nextId = parsed.nextId;
  }
}

// Classes are already exported with 'export class' keyword
