import Main from "../src/main";

test("arr result", () => {
  const test = Main;
  expect(test()).toStrictEqual([12, 3, 45, 6]);
});
