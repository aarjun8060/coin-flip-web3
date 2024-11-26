import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../../styles/Navbar.module.css";
import Link from 'next/link';

export default function Navbar() {
	return (
		<nav className={styles.navbar}>
			<Link href="/">
				<div 
					style={{
						color:"#fff",
						fontSize:24
					}}
				>
				Flip Game
				</div>
			</Link>
			<ConnectButton/>
		</nav>
	);
}
