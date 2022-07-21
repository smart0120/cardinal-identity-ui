import Document, { Html, Head, Main, NextScript } from 'next/document'
import { extractCritical } from '@emotion/server'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    const critical = extractCritical(initialProps.html)
    initialProps.html = critical.html
    initialProps.styles = (
      <>
        {initialProps.styles}
        <style
          data-emotion-css={critical.ids.join(' ')}
          dangerouslySetInnerHTML={{ __html: critical.css }}
        />
      </>
    )

    return initialProps
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <title>Cardinal | Identity</title>
          <style
            data-emotion-css={this.props.ids?.join(' ')}
            dangerouslySetInnerHTML={{ __html: this.props.css }}
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="twitter.cardinal.so" />
          <meta name="twitter:url" content="https://twitter.cardinal.so/" />
          <meta name="twitter:creator" content="@cardinal_labs" />
          <meta
            name="twitter:title"
            content="Claim your Twitter handle on Solana!"
          />
          <meta
            name="twitter:description"
            content="Secure your identity on Solana by claiming your Twitter handle as an NFT, powered by Cardinal protocol."
          />
          <meta
            name="twitter:image"
            content="https://twitter.cardinal.so/assets/twitter-card.png"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
