var Napkin = Napkin || {};

(function(N){
    if (!N.Class){
        throw Error ('napkin/grid.js depends on napkin/napkin.js');
    }

    var Grid = N.dom.Element.extend(function(data){
        data.rows = data.rows || [];
        Grid.superclass.constructor.call(this, 'TABLE', data);
    })
        .method('build', function(){
            var el = Grid.superclass.build.call(this), i, l;
            this.tbody = new N.dom.Element('TBODY');
            for (i = 0, l = this.rows.length; i< l; i++){
                this.tbody.element.appendChild(this.rows[i].render());
            }
            el.appendChild(this.tbody.render());
            return el;
        })
        .method('render', function(){
            this.container.appendChild(this.element);
        })
        .method('addRow', function(row){
            this.rows.push(row);
            this.tbody.append(row);
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

    var GridRow = N.dom.Element.extend(function(data){
        data.cells = data.cells || [];
        GridRow.superclass.constructor.call(this, 'TR', data);
    })
        .method('build', function(){
            var el = GridRow.superclass.build.call(this), i, l;
            for (i = 0, l = this.cells.length; i < l; i++){
                el.appendChild(this.cells[i].render());
            }
            return el;
        })

        .method('addCell', function(cell){
            this.cells.push(cell);
            this.element.appendChild(cell.render());
        });


    var GridCell = N.dom.Element.extend(function(data){
        data = data || {};
        this.tag = this.tag || 'TD';
        data.content = data.content || ' ';
        GridCell.superclass.constructor.call(this, this.tag, data);
    })
        .method('build', function(){
            var el = GridCell.superclass.build.call(this);
            if (typeof this.content === 'string'){
                el.innerText = this.content;
            } else {
                el.appendChild(this.content);
            }
            return el;
        });


    var GridHeaderCell = GridCell.extend(function(data){
        this.tag = 'TH';
        GridHeaderCell.superclass.constructor.call(this, data);
    });


    N.grid = N.grid || {};
    N.Grid = Grid;
    N.grid.Row = GridRow;
    N.grid.Cell = GridCell;
    N.grid.HeaderCell = GridHeaderCell;


})(Napkin);