function getEvents(tx, event = null) {
  const stack = [];

  tx.logs.forEach((item) => {
    if (event) {
      if (event === item.event) {
        stack.push(item.args);
      }
    } else {
      if (!stack[item.event]) {
        stack[item.event] = [];
      }
      stack[item.event].push(item.args);
    }
  });

  if (Object.keys(stack).length === 0) {
    throw new Error('No Events fired');
  }

  return stack;
}

module.exports = {
  getEvents
};
