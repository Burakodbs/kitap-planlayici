// Basic test to ensure testing infrastructure works
describe('Basic Test', () => {
  test('math works correctly', () => {
    expect(2 + 2).toBe(4);
  });

  test('string operations work', () => {
    expect('hello world').toContain('world');
  });
});