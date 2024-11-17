import * as dotenv from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

dotenv.config();

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const deployment = await deploy('RealAave', {
        from: deployer,
        log: true,
    });
    console.log('Deployed')

    await hre.run('verify:verify', {
        address: deployment.address,
    });
    console.log('Verified')
}

deployFunc.tags = ['RealAave'];
deployFunc.dependencies = [];
export default deployFunc;
