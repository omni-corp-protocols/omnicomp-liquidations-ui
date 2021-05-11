import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Box, Typography } from "@material-ui/core";
import styled from "styled-components";

import ProtocolState from "../../containers/ProtocolState";
import AllAccountState from "../../containers/AllAccountState";
import AccountAddress from "../../containers/AccountAddress";
import AccountState from "../../containers/AccountState";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const Label = styled.span`
  color: #999999;
`;
const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AccountDetails = () => {
  const classes = useStyles();

  const { cTokenStates } = ProtocolState.useContainer();
  const { accountGlobalStates } = AllAccountState.useContainer();
  const { accountAddress } = AccountAddress.useContainer();
  const { accountCTokenState } = AccountState.useContainer();

  if (
    cTokenStates !== null &&
    accountCTokenState !== null &&
    accountAddress !== null &&
    accountGlobalStates !== null
  ) {
    const noSupply: boolean = !Object.keys(accountCTokenState).some(
      (state, index) => accountCTokenState[state].supplyBalance !== "0"
    );
    const noBorrow: boolean = !Object.keys(accountCTokenState).some(
      (state, index) => accountCTokenState[state].borrowBalance !== "0"
    );

    return (
      <Box>
        <Typography variant="subtitle1">Account {accountAddress}</Typography>
        <Status>
          <Label>State: </Label>
          {Number(
            accountGlobalStates[accountAddress.toLowerCase()]?.accountLiquidity
          ) < 0
            ? "Unsafe"
            : "Safe"}
        </Status>
        <br />

        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Collateral Assets</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Amount&nbsp;($)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(accountCTokenState).map(
                (state, index) =>
                  accountCTokenState[state].supplyBalance !== "0" && (
                    <TableRow key={state}>
                      <TableCell component="th" scope="row">
                        {cTokenStates[state].underlyingSymbol}
                      </TableCell>
                      <TableCell align="right">
                        {accountCTokenState[state].supplyBalance}
                      </TableCell>
                      <TableCell align="right">
                        {accountCTokenState[state].supplyBalanceUsd}
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
          {noSupply && (
            <Typography align="center">
              No Asset Supplied as Collateral
            </Typography>
          )}
        </TableContainer>
        <br />
        <br />
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Minted Assets</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Amount&nbsp;($)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(accountCTokenState).map(
                (state, index) =>
                  accountCTokenState[state].borrowBalance !== "0" && (
                    <TableRow key={state}>
                      <TableCell component="th" scope="row">
                        {cTokenStates[state].underlyingSymbol}
                      </TableCell>
                      <TableCell align="right">
                        {accountCTokenState[state].borrowBalance}
                      </TableCell>
                      <TableCell align="right">
                        {accountCTokenState[state].borrowBalanceUsd}
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
          {noBorrow && <Typography align="center">No Asset Minted</Typography>}
        </TableContainer>
      </Box>
    );
  } else {
    return <></>;
  }
};

export default AccountDetails;
