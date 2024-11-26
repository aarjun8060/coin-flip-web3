require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config()

module.exports = {
	solidity: {
		version: "0.8.18",
		settings: {
			optimizer: {
				enabled: true
			}
		}
	},
	allowUnlimitedContractSize: true,
	networks: {
		// mumbai: {
		// 	url: process.env.MUMBAI_URL,
		// 	accounts: [process.env.PRIVATE_KEY]
		// },
		sepolia: {
			url: "https://eth-sepolia.g.alchemy.com/v2/geMr0J9-jW9pcedyUnzeXTpacU2j9KA2",
			accounts: ["4f199e92c9457728f53bd5475f6a7f4cf7f5752bec54a42125f118e4d52ec9a2"],
			chainId: 11155111,
		},
	},
	etherscan: {
		apiKey: {
		  sepolia: "1PVZ9YDTWBP3PX6FFHHTR38DTX67CWWYU4", // Replace with your actual API key
		},
	},
}