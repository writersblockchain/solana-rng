use cosmwasm_std::{Addr, Binary};
use secret_toolkit::utils::HandleCallback;
use secret_path::msg::{PostExecutionMsg, PrivContractHandleMsg};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct InstantiateMsg {
    pub gateway_address: Addr,
    pub gateway_hash: String,
    pub gateway_key: Binary,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    Input { message: PrivContractHandleMsg }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum MigrateMsg {
    Migrate {},
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    Query {}
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum GatewayMsg {
    Output { outputs: PostExecutionMsg },
}

impl HandleCallback for GatewayMsg {
    const BLOCK_SIZE: usize = 256;
}
