import { passwordCheckHandler } from "next-password-protect";

export default passwordCheckHandler("theFutureIsNow$$$", {
  // Options go here (optional)
  cookieName: "next-password-protect",
});