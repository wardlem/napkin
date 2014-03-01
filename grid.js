var Napkin = Napkin || {};

(function(N){
    if (!N.Class){
        throw Error ('napkin/grid.js depends on napkin/napkin.js');
    }

    var Grid = N.Class.extend(function(data){
        this.container = data.container || null;
        this.id = data.id || '';
        this.class = data.class || '';
        if (typeof this.class === 'string'){
            this.class = [this.class];
        }
        this.rows = data.rows || [];
        this.element = this.build();
    })
        .method('build', function(){
            var el = document.createElement('TABLE'), i, l;
            if (this.id) el.id = this.id;
            if (this.class) el.className = this.class.join(' ');
            for (i = 0, l = this.rows.length; i< l; i++){
                el.appendChild(this.rows[i].render());
            }
            return el;
        })
        .method('render', function(){
            this.container.appendChild(this.element);
        })
        .method('addRow', function(row){
            this.rows.push(row);
            this.element.appendChild(row.render());
        })
        .method('removeRow', function(row){
            var i,l;
            for(i = 0, l = this.rows.length; i < l; i++){
                if (this.rows[i] === row){
                    this.rows.slice(i, 1);
                    this.element.removeChild(row.render());
                }
            }
        });

    var GridRow = N.Class.extend(function(data){
        this.cells = data.cells || [];
        this.entityId = data.entityId || null;
        this.id = data.id || '';
        this.class= this.class || '';
        if (this.class && typeof this.class === 'string'){
            this.class = [this.class];
        }
        this.element = this.build();
    })
        .method('build', function(){
            var el = document.createElement('TR'), i, l;
            if (this.id) el.id = this.id;
            if (this.class) el.className = this.class.join(' ');
            for (i = 0, l = this.cells.length; i< l; i++){
                el.appendChild(this.cells[i].render());
            }
            return el;
        })
        .method('render', function(){
            return this.element;
        })
        .method('addCell', function(cell){
            this.cells.push(cell);
            this.element.appendChild(cell.render());
        });


    var GridCell = N.Class.extend(function(data){
        data = data || {}
        this.id = data.id || '';
        this.class= data.class || '';
        this.content = data.content || '';
        this.element = this.build();

    })
        .method('build', function(){
            var el = document.createElement('TD');
            if (this.id) el.id = this.id;
            if (this.class) el.className = this.class.join(' ');
            if (typeof this.content === 'string'){
                el.innerText = this.content;
            } else {
                el.appendChild(this.content);
            }

            return el;
        })
        .method('render', function(){
            return this.element;
        });


    var GridHeaderCell = GridCell.extend(function(data){
        GridHeaderCell.superclass.constructor.call(this, data);
    })
        .method('build', function(){
            var el = document.createElement('TH');
            if (typeof this.content === 'string'){
                el.innerText = this.content;
            } else {
                el.appendChild(this.content);
            }
            return el;
        });

    N.grid = N.grid || {};
    N.Grid = Grid;
    N.grid.Row = GridRow;
    N.grid.Cell = GridCell;
    N.grid.HeaderCell = GridHeaderCell;


})(Napkin);