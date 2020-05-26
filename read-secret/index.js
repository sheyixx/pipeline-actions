const core = require('@actions/core');
const axios = require('axios');
const config = require('../config');

const INPUT_KEY_REQUEST_TOKENS = 'request-tokens';
const INPUT_KEY_REPO = 'repository';
const INPUT_KEY_AUTH_TOKEN = 'token';
const INPUT_KEY_IGNORE_FAILURE = 'ignore-failure';

async function run() {
  try {
    const requiredTokens = core.getInput(INPUT_KEY_REQUEST_TOKENS, { required: true });
    const repository = core.getInput(INPUT_KEY_REPO, { required: true });
    const token = core.getInput(INPUT_KEY_AUTH_TOKEN, { required: true });

    if (!token) {
      return core.setFailed("Token was not set and not present in env GITHUB_TOKEN");
    }

    const response = await axios.post(config.secretStoreUrl, null, {
      headers: {
        "x-github-repository": repository,
        "x-github-token": token,
        "x-required-tokens": requiredTokens,
      },
    });

    for (let [tokenName, tokenValue] of Object.entries(response.data)) {
      if (!tokenValue) {
        return;
      }

      console.log(':: Setting token: ' + tokenName);

      core.setOutput(tokenName, tokenValue);
      core.setSecret(tokenValue);
    }
  } catch (err) {
    console.log(err);

    if (core.getInput(INPUT_KEY_IGNORE_FAILURE) === 'true') {
      core.setOutput('value', {});
    } else {
      core.setFailed(err.message);
    }
  }
}

run();
