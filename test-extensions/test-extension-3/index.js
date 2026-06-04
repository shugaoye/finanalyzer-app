// Test extension widget implementation

class TestWidget {
  constructor() {
    this.name = 'Test Widget 3';
  }

  render() {
    return {
      type: 'div',
      props: {
        children: 'Hello from Test Extension 3!'
      }
    };
  }

  getData() {
    return {
      message: 'Test data from extension'
    };
  }
}

// Export widget
export default TestWidget;
