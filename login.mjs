// Run this yourself: sign in to CloudDeck in the window, open the page with the Start button, then press Enter here.
// It saves the page URL and your session cookie straight into the repo's GitHub secrets; nothing is printed or stored.
import { chromium } from "playwright"
import { execFileSync } from "node:child_process"
import { createInterface } from "node:readline/promises"
import { existsSync, readFileSync, writeFileSync } from "node:fs"

const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.cache/clouddeck-login`, { headless: false })
const page = ctx.pages()[0] ?? (await ctx.newPage())
const last = `${process.env.HOME}/.cache/clouddeck-login/last-url`
await page.goto(existsSync(last) ? readFileSync(last, "utf8") : "https://duckduckgo.com/?q=clouddeck+login")
const rl = createInterface({ input: process.stdin, output: process.stdout })
await rl.question("Sign in to CloudDeck in the window, open the page with your PC's Start button, then press Enter here... ")
rl.close()
const url = page.url()
writeFileSync(last, url)
// The whole browser state: cookies on every CloudDeck host plus the page's localStorage (where many sites keep the login).
const state = await ctx.storageState()
const host = new URL(url).hostname.split(".").slice(-2).join(".")
state.cookies = state.cookies.filter((c) => c.domain.replace(/^\./, "").endsWith(host))
state.origins = state.origins.filter((o) => new URL(o.origin).hostname.endsWith(host))
await ctx.close()
console.log(`Found ${state.cookies.length} cookies and ${state.origins.reduce((n, o) => n + o.localStorage.length, 0)} storage keys for ${host}.`)
const set = (name, value) => execFileSync("gh", ["secret", "set", name, "-R", "homelessharper1991-blip/clouddeck-restarter"], { input: value, stdio: ["pipe", "inherit", "inherit"] })
set("DASHBOARD_URL", url)
set("CLOUDDECK_STATE", Buffer.from(JSON.stringify(state)).toString("base64"))
console.log(`Saved the secrets for ${new URL(url).hostname}. Close this window.`)
