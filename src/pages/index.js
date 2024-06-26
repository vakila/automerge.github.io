import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import styles from './index.module.css'
import HomepageFeatures from '../components/HomepageFeatures'
import '@fontsource/merriweather'
import '@fontsource/overpass'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--secondary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="docs/hello">
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}

function IntroVideo() {
  const style = {
    display: "flex",
    alignItems: "center",
    padding: "2rem 0",
    width: "100%"
  };

  return (<section style={style}>
    <div className="container text--center">
      <h2>Automerge in Action</h2>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/L9fdyDlhByM?si=skxe0RBRA_OXmXgD" title="YouTube video player" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
    </div>
  </section>)
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.description}
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <IntroVideo />
      </main>
    </Layout>
  )
}
