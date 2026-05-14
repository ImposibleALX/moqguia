/** Simple 1D Kalman Filter for GPS coordinate smoothing */
export class KalmanFilter {
  private q: number; // process noise
  private r: number; // measurement noise
  private x: number; // current estimate
  private p: number; // error covariance
  private initialized = false;

  constructor(q = 0.00001, r = 0.01) {
    this.q = q;
    this.r = r;
    this.x = 0;
    this.p = 1;
  }

  filter(measurement: number, accuracy = 20): number {
    // Adapt measurement noise based on GPS accuracy (meters)
    const adaptiveR = this.r * (accuracy / 5);

    if (!this.initialized) {
      this.x = measurement;
      this.initialized = true;
      return measurement;
    }
    // Prediction
    this.p = this.p + this.q;
    // Update
    const k = this.p / (this.p + adaptiveR);
    this.x = this.x + k * (measurement - this.x);
    this.p = (1 - k) * this.p;
    return this.x;
  }

  reset() {
    this.initialized = false;
    this.p = 1;
  }
}
