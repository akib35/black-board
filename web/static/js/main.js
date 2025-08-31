class DrawingBoard {
  constructor() {
    this.canvas = document.getElementById("drawingCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.isDrawing = false;
    this.currentColor = "#000000";
    this.currentLineWidth = 2;

    // WebSocket connection
    this.ws = null;
    this.connectWebSocket();

    this.setupCanvas();
    this.setupEventListeners();
    this.setupTools();
  }

  connectWebSocket() {
    this.ws = new WebSocket("ws://localhost:8080/ws");

    this.ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      this.handleWebSocketMessage(msg);
    };

    this.ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      // Try to reconnect after 3 seconds
      setTimeout(() => this.connectWebSocket(), 3000);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  handleWebSocketMessage(msg) {
    // Handle incoming messages from other users
    switch (msg.type) {
      case "draw":
        this.drawFromRemote(msg.data);
        break;
      case "clear":
        this.clearCanvas();
        break;
    }
  }

  drawFromRemote(data) {
    // Draw actions received from other users
    this.ctx.strokeStyle = data.color;
    this.ctx.lineWidth = data.lineWidth;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    this.ctx.beginPath();
    this.ctx.moveTo(data.startX, data.startY);
    this.ctx.lineTo(data.endX, data.endY);
    this.ctx.stroke();

    // Reset to current user's settings
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentLineWidth;
  }

  setupCanvas() {
    // Set canvas size based on container
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    // Set initial canvas styles
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentLineWidth;
  }

  resizeCanvas() {
    const container = document.querySelector(".canvas-container");
    const containerWidth = container.clientWidth - 20;
    const containerHeight = container.clientHeight - 20;

    // Maintain aspect ratio (4:3)
    const aspectRatio = 4 / 3;
    let width, height;

    if (containerWidth / containerHeight > aspectRatio) {
      height = containerHeight;
      width = height * aspectRatio;
    } else {
      width = containerWidth;
      height = width / aspectRatio;
    }

    this.canvas.width = width;
    this.canvas.height = height;

    // Clear and set background
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener("mousedown", (e) => this.startDrawing(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.stopDrawing());
    this.canvas.addEventListener("mouseout", () => this.stopDrawing());

    // Touch events for mobile
    this.canvas.addEventListener("touchstart", (e) =>
      this.handleTouch(e, "start"),
    );
    this.canvas.addEventListener("touchmove", (e) =>
      this.handleTouch(e, "move"),
    );
    this.canvas.addEventListener("touchend", (e) => this.handleTouch(e, "end"));

    // Clear button
    document
      .getElementById("clearBtn")
      .addEventListener("click", () => this.clearCanvas());
  }

  setupTools() {
    // Color buttons
    document
      .getElementById("colorBlack")
      .addEventListener("click", () => this.setColor("#000000"));
    document
      .getElementById("colorRed")
      .addEventListener("click", () => this.setColor("#ff0000"));
    document
      .getElementById("colorBlue")
      .addEventListener("click", () => this.setColor("#0000ff"));

    // Brush size buttons
    document
      .getElementById("brushSmall")
      .addEventListener("click", () => this.setLineWidth(2));
    document
      .getElementById("brushLarge")
      .addEventListener("click", () => this.setLineWidth(8));
  }

  handleTouch(e, action) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(
      {
        start: "mousedown",
        move: "mousemove",
        end: "mouseup",
      }[action],
      {
        clientX: touch.clientX,
        clientY: touch.clientY,
      },
    );
    this.canvas.dispatchEvent(mouseEvent);
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  startDrawing(e) {
    this.isDrawing = true;
    const pos = this.getMousePos(e);
    this.lastX = pos.x;
    this.lastY = pos.y;
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  draw(e) {
    if (!this.isDrawing) return;

    const pos = this.getMousePos(e);

    // Draw locally
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();

    // Send drawing data to other users
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const drawData = {
        startX: this.lastX,
        startY: this.lastY,
        endX: pos.x,
        endY: pos.y,
        color: this.currentColor,
        lineWidth: this.currentLineWidth,
      };

      this.ws.send(
        JSON.stringify({
          type: "draw",
          data: drawData,
        }),
      );
    }

    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.ctx.beginPath();
    }
  }

  clearCanvas() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Notify other users
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "clear",
          data: {},
        }),
      );
    }
  }

  setColor(color) {
    this.currentColor = color;
    this.ctx.strokeStyle = color;
  }

  setLineWidth(width) {
    this.currentLineWidth = width;
    this.ctx.lineWidth = width;
  }
}

// Initialize the drawing board when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new DrawingBoard();
});
