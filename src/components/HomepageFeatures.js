import React from 'react'
import clsx from 'clsx'
import styles from './HomepageFeatures.module.css'

const FeatureList = [
  {
    title: 'Conflicts are obsolete',
    Svg: require('../../static/img/merge.svg').default,
    description: (
      <>
        The core of Automerge is a Conflict-Free Replicated Data Type (CRDT), which allows concurrent changes on different devices
        to be merged automatically without requiring any central server.
      </>
    ),
  },
  {
    title: 'Clouds are optional',
    Svg: require('../../static/img/network.svg').default,
    description: (
      <>
        Automerge's sync engine supports any connection-oriented network protocol: client-server, peer-to-peer, or local. You can even send an Automerge file as an email attachment or store it on a file server.
      </>
    ),
  },
  {
    title: 'Collaboration is cross-platform',
    Svg: require('../../static/img/portable.svg').default,
    description: (
      <>
        Implemented in <a href="https://github.com/automerge/automerge">JavaScript</a> and{' '}
        <a href="https://github.com/automerge/automerge-rs">Rust</a>, with FFI bindings across platforms including iOS,
        Electron, Chrome, Safari, Edge, Firefox, and more.
      </>
    ),
  },
]

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <h2 className="text--center">The Automerge Advantage</h2>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
