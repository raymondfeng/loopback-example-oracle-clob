'use strict';

module.exports = function(Message) {
  // A workaournd to use Ctrl+C to terminate the application
  // For some reason, Oracle connection pool cannot be closed gracefully
  process.on('SIGINT', () => {
    console.log('SIGHUP signal received.');
    let ds = Message.app.dataSources.oracle;
    process.nextTick(() => process.exit(15));
    // For some reason, ds.disconnect will block
    // ds.disconnect(() => console.log('DataSource disconnected.'));
  });

/**
 * Get content from Oracle by calling the stored procedure
 */
  Message.getContent = function(res, cb) {
    let ds = Message.app.dataSources.oracle;
    // Access the oracledb driver
    let oracle = ds.connector.driver;
    // SQL for the stored procedure call
    let sql = 'begin GET_CONTENT(:id,:resObj); end;';
    // Acquire a connection from the data source connection pool
    ds.connector.pool.getConnection(function(err, connection) {
      if (err) return cb(err);
      // Run the SQL statement
      connection.execute(sql, {
        id: '1',
        resObj: {dir: oracle.BIND_OUT, type: oracle.CLOB},
      }, {},
      function(err, result) {
        if (err) return cb(err);
        // Access the clob as stream
        var clob = result.outBinds.resObj;
        if (clob) {
          console.log('CLOB stream is ready.');
          // Set up the 'end' event to release the connection back to the pool
          clob.on('end', () => {
            console.log('CLOB stream is complete.');
            process.nextTick(() => connection.release());
          });
        }
        // Callback with the clob and content type
        cb(err, clob, 'text/plain');
      });
    });
  };

  Message.remoteMethod('getContent', {
    // Access res object to release connections
    accepts: [{arg: 'res', type: 'object', http: {source: 'res'}}],
    returns: [
      {arg: 'body', type: 'file', root: true}, // The stream
      {arg: 'Content-Type', type: 'string', http: {target: 'header'}}, // The content type
    ],
    http: {verb: 'get', path: '/content'},
  });
};
