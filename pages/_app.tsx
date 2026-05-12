import { LoginComponent } from '@/src/components/LoginComponent';
import '@/styles/globals.css'
import { withPasswordProtect } from 'next-password-protect';
import type { AppProps } from 'next/app'

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default process.env.NEXT_PUBLIC_PASSWORD_PROTECT
  ? withPasswordProtect(App, {
    // Options go here (optional)
    loginApiUrl: "api/login",
    loginComponent: LoginComponent,
    loginComponentProps: {
      buttonBackgroundColor: "#005943",
      buttonColor: "#FFF",
      logo: "/main_green.svg"
    }
  })
  : App;