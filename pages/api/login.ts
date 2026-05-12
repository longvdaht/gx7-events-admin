import { loginHandler } from "next-password-protect";

export default loginHandler("theFutureIsNow$$$", {
  // Options go here (optional)
  cookieName: "next-password-protect",
  cookieMaxAge: 21600000,
});