import { expect, test } from "@jest/globals"
import BaseObject from "../../models/BaseObject"

test("Instantiate Account", () => {
  const baseObject = BaseObject.instantiate({
    foo: "bar",
  })

  expect(baseObject._toJSON()).toStrictEqual({
    foo: "bar",
  })
})
