import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import Head from "@docusaurus/Head";
import styles from "./index.module.css";
import CodeShow from "@site/src/components/code.md";
import clsx from "clsx";

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="description" content="🐻 承担 React 中状态管理的必需品"></meta>
        <meta property="og:description" content="Zustand 中文文档" />
        <meta name="og:image" content="/bear.jpg"></meta>
        <meta charSet="utf-8" />
        <title>{siteConfig.title}</title>
        <link rel="canonical" href="https://zustand.acebook.cc" />
      </Head>

      <main className={styles.container}>
        <img alt="" src={require("@site/static/img/bear.jpg").default} />
        <div className={styles.container_inset}>
          <header className={styles.header}>
            <span className="header-left">Zustand</span>
            <div className={styles.nav}>
              <Link className="p1" to="/docs/intro">
                中文文档
              </Link>
              <Link className="p1" to="https://github.com/pmndrs/zustand">
                官方Github
              </Link>
            </div>
          </header>

          <div className={styles.code}>
            <div className={clsx(styles.codeContainer,'prism-code language-jsx thin-scrollbar')}>
              <CodeShow ></CodeShow>
            </div>
          </div>

          <footer className={styles.footer}>
            <p>该网站并非官方中文文档</p>
          </footer>
        </div>
      </main>
    </>
  );
}
