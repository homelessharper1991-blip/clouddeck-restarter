// Opens the CloudDeck dashboard with the owner's saved session and clicks Start if the PC is off.
import { chromium } from "playwright"

const url = process.env.DASHBOARD_URL
const cookie = process.env.CLOUDDECK_COOKIE ?? ""
const start = new RegExp(process.env.START_TEXT || "^\\s*(start|power on|turn on|boot|launch)\\b", "i")
if (!url || !cookie) throw new Error("DASHBOARD_URL and CLOUDDECK_COOKIE secrets are required")

const host = new URL(url).hostname
const cookies = cookie.split(";").map((c) => c.trim()).filter(Boolean).map((c) => {
  const i = c.indexOf("=")
  return { name: c.slice(0, i), value: c.slice(i + 1), domain: host, path: "/", secure: true }
})

const browser = await chromium.launch()
const ctx = await browser.newContext()
await ctx.addCookies(cookies)
const page = await ctx.newPage()
await page.goto(url, { waitUntil: "networkidle" })
await page.screenshot({ path: "before.png", fullPage: true })

if (/log ?in|sign ?in/i.test(page.url()) || (await page.getByRole("button", { name: /log ?in|sign ?in/i }).count())) {
  console.log("SIGNED OUT: refresh the CLOUDDECK_COOKIE secret")
  process.exitCode = 1
} else {
  const button = page.getByRole("button", { name: start }).first()
  if (await button.count()) {
    await button.click()
    await page.waitForTimeout(5000)
    console.log("PC was off: clicked", await button.textContent().catch(() => "start"))
  } else console.log("PC is on (no start button)")
}
await page.screenshot({ path: "after.png", fullPage: true })
await browser.close()
