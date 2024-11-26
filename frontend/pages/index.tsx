import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import BettingComponent from "../components/BettingComponent";

const Home: NextPage = () => {
  return (
    <main className={styles.main}>
      <Head>
        <title>Head Tail Game</title>
        <meta name="description" content="Head Tail Game" />
      </Head>
      <BettingComponent />
    </main>
  );
};

export default Home;
