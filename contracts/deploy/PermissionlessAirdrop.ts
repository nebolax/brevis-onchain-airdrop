import * as dotenv from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

dotenv.config();

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args: string[] = [
    '0xa082F86d9d1660C29cf3f962A31d7D20E367154F', // Sepolia Brevis Request Contract Address
    "0x0000000000000000000000000000000000000000000000000000000000000000", // vkHash
    "0x65f57e2d8247f4F4Adb4E0beF35801c01eba9dac", // airdroppingToken
  ]; 
  const deployment = await deploy('PermissionlessAirdrop', {
    from: deployer,
    log: true,
    args: args
  });

  await hre.run('verify:verify', {
    address: deployment.address,
    constructorArguments: args ?? deployment.args
  });
};

deployFunc.tags = ['PermissionlessAirdrop'];
deployFunc.dependencies = [];
export default deployFunc;
