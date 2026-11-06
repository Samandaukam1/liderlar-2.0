import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adabiyotXLinkUrl,
  formatLinkCode,
  hashLinkToken,
  issueAdabiyotXLink,
  randomLinkCode,
} from "../src/lib/adabiyotx-link/link-token.ts";

test("token: hash bazaga, xom qiymat havolaga", () => {
  const now = new Date("2026-11-06T10:00:00Z");
  const issued = issueAdabiyotXLink(now);
  assert.ok(issued.token.length >= 30);
  assert.equal(issued.tokenHash, hashLinkToken(issued.token));
  assert.notEqual(issued.tokenHash, issued.token);
  assert.equal(issued.expiresAt, "2026-11-06T10:15:00.000Z");
  assert.equal(issued.universalLink, adabiyotXLinkUrl(issued.token, issued.code));
  assert.ok(issued.universalLink.endsWith(`&code=${issued.code}`));
  assert.ok(issued.universalLink.startsWith("https://adabiyotx.uz/link/liderlar?token="));
  assert.ok(issued.appLink.startsWith("adabiyotx://link/liderlar?token="));
});

test("qo'lda kiritiladigan kod 8 ta aniq belgi", () => {
  for (let i = 0; i < 50; i++) {
    const code = randomLinkCode();
    assert.match(code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
  }
  assert.equal(formatLinkCode("ABCDEFGH"), "ABCD-EFGH");
});
