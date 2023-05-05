const WindiCSSWebpackPlugin = require('windicss-webpack-plugin')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: { unoptimized: true },
  // compiler: { removeConsole: { exclude: ['error'] } },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: config => {
    const fileLoaderRule = config.module.rules.find(rule => rule.test && rule.test.test('.svg'))
    fileLoaderRule.exclude = /\.svg$/
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: { and: [/\.(js|ts)x?$/] },
      loader: require.resolve('@svgr/webpack', 'url-loader')
    })

    config.plugins.push(new WindiCSSWebpackPlugin())
    return config
  }
}

module.exports = nextConfig
