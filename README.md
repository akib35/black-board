# Black Board - Multi-User Drawing Tool

A real-time collaborative drawing application built with Go and WebSocket technology. Multiple users can draw simultaneously on a shared canvas with real-time synchronization.

## Features

- **Real-time Collaboration**: Multiple users can draw on the same canvas simultaneously
- **WebSocket Communication**: Instant synchronization of drawing actions across all connected clients
- **Drawing Tools**:
  - Multiple colors (Black, Red, Blue)
  - Variable brush sizes (Small, Large)
  - Clear canvas functionality
- **Responsive Design**: Works on both desktop and mobile devices
- **Touch Support**: Full touch support for mobile and tablet devices
- **Auto-reconnection**: Automatically reconnects if the WebSocket connection is lost

## Technology Stack

- **Backend**: Go with Gorilla WebSocket
- **Frontend**: Vanilla JavaScript with HTML5 Canvas
- **Styling**: Pure CSS with responsive design
- **Real-time Communication**: WebSocket protocol

## Installation

### Prerequisites

- Go 1.16 or higher
- Git

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd black-board
```

2. Install Go dependencies:
```bash
go mod tidy
```

3. Run the server:
```bash
go run cmd/server/main.go
```

4. Open your browser and navigate to:
```
http://localhost:8080
```

## Project Structure

```
black-board/
├── cmd/server/
│   └── main.go              # Main server application
├── web/
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css    # Application styles
│   │   └── js/
│   │       └── main.js      # Frontend JavaScript
│   └── templates/
│       └── index.html       # Main HTML template
├── go.mod                   # Go module file
└── README.md               # This file
```

## How It Works

1. **Server**: The Go server handles HTTP requests and WebSocket connections
2. **Client Connection**: Each user connects via WebSocket when they load the page
3. **Drawing Events**: When a user draws, the action is sent to all other connected clients
4. **Real-time Sync**: All users see the same canvas state in real-time

## API/WebSocket Messages

The application uses JSON messages over WebSocket:

### Draw Message
```json
{
  "type": "draw",
  "data": {
    "startX": 100,
    "startY": 150,
    "endX": 110,
    "endY": 160,
    "color": "#ff0000",
    "lineWidth": 2
  }
}
```

### Clear Message
```json
{
  "type": "clear",
  "data": {}
}
```

## Usage

1. Open the application in your browser
2. Start drawing on the canvas using your mouse or touch input
3. Use the toolbar to:
   - Change colors (Black, Red, Blue)
   - Adjust brush size (Small, Large)
   - Clear the entire canvas
4. Share the URL with others to collaborate in real-time

## Browser Compatibility

- Modern browsers with HTML5 Canvas support
- WebSocket support required
- Tested on Chrome, Firefox, Safari, and Edge

## Development

### Running in Development Mode

```bash
# Run the server
go run cmd/server/main.go

# The server will start on port 8080
# Visit http://localhost:8080 to test
```

### Building for Production

```bash
# Build the binary
go build -o blackboard cmd/server/main.go

# Run the binary
./blackboard
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- [ ] User authentication and rooms
- [ ] More drawing tools (shapes, text, etc.)
- [ ] Canvas save/load functionality
- [ ] Undo/redo functionality
- [ ] More color options and color picker
- [ ] Drawing layers
- [ ] Chat functionality

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please create an issue in the repository.
