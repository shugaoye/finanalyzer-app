module.exports = {
  hello: () => 'Hello from Test Extension 1',
  widget: {
    render: () => '<div>Test Widget 1</div>',
    getData: () => ({ message: 'Widget 1 data' })
  }
};