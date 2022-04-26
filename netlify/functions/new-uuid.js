//
// new-uuid.js
// - Create UUID (primarily for Safari < 15.4)
//
// SPDX-License-Identifier: Jam
//

import { randomUUID } from 'crypto';

exports.handler = async () => {

	return {
    statusCode: 200,
    body: randomUUID()
  }

};
