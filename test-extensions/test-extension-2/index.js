module.exports = {
  hello: () => 'Hello from Test Extension 2',
  widget: {
    render: () => '<div>Test Widget 2</div>',
    getData: () => ({ message: 'Widget 2 data' })
  }
};