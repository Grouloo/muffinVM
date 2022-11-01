import { expect, test } from "@jest/globals"
import Account from "../../models/Account"

test("Instantiate Account", () => {
  const account = Account.instantiate({
    nonce: 0,
    balance: 1000,
    isOwned: true,
    address: "0x0",
  })

  expect(account._toJSON()).toStrictEqual({
    nonce: 0,
    balance: 1000,
    isOwned: true,
    address: "0x0",
  })
})
