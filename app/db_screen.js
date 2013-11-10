global.DbScreen = jClass.extend({
  init: function(connection, callback) {
    this.connection = connection;

    this.view = new DbScreenView(this);

    this.fetchDbList();
    this.initEvent();
  },

  initEvent: function() {
    this.view.databaseSelect.bind('change', this.databseSelected.bind(this));
  },

  // short cut
  query: function(sql, callback){
    return this.connection.query(sql, callback);
  },

  fetchDbList: function (callback) {
    this.connection.listDatabases(function(databases) {
      this.view.renderDbList(databases);
      callback && callback();
    }.bind(this));
  },

  databseSelected: function(e){
    e && e.preventDefault();
    this.selectDatabase(this.view.getSelectedDatabase());
  },

  selectDatabase: function (database) {
    this.database = database;
    this.connection.switchDb(this.database, function () {
      this.connection.tablesAndSchemas(function(data) {
        this.view.renderTablesAndSchemas(data);
      }.bind(this));
    }.bind(this));
  },

  tableSelected: function(schema, tableName, node) {
    this.currentSchema = schema;
    this.currentTable = tableName;

    if (this.currentTableNode) this.currentTableNode.removeClass('selected');
    this.currentTableNode = $u(node);
    this.currentTableNode.addClass('selected');

    this.fetchTableStructure(schema, tableName);
    this.view.showTab('structure');
  },

  fetchTableStructure: function(schema, table) {
    this.connection.tableStructure(schema, table, function (data) {
      this.view.renderTableStructureTab(data.rows);
    }.bind(this));
  },

  extensionsTabActivate: function () {
    this.connection.getExtensions(function(rows) {
      this.view.renderExtensionsTab(rows);
    }.bind(this));
  },

  contentTabActivate: function() {
    this.connection.getTableContent(this.currentSchema, this.currentTable, function(data) {
      this.connection.tableStructure(this.currentSchema, this.currentTable, function (sdata) {
        data.fields.forEach(function(feild) {
          sdata.rows.forEach(function(r) {
            if (r.column_name == feild.name) feild.real_format = r.udt_name;
          });
        });
        this.view.renderContentTab(data);
      }.bind(this));
    }.bind(this));
  },

  usersTabActivate: function() {
    this.connection.getUsers(function(rows) {
      this.view.renderUsersTab(rows);
    }.bind(this));
  }
});

/*

function renderMainScreen () {
  renderPage('main', {}, function(node) {
    var element = $u(node);
    var list = element.find('ul.databases');
    query('SELECT datname FROM pg_database WHERE datistemplate = false;', function(rows) {
      rows.rows.forEach(function(dbrow) {
        console.log(dbrow);
        var tree = DOMinate([
          'li', ['a', dbrow.datname]
        ]);
        list.append(tree[0]);
      });
    });
  })
}

*/