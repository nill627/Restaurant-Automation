import '../../imports/api/table.js';
import { Tables, Table, TableStatus } from '../../imports/api/table.js';

Template.table.events({
    'click .icon.link' () {
        console.log(event.currentTarget.id);
    },
    'click .ui.teal.button' () {
		Table.findOne({ _id: this._id }).updateTableStatus(TableStatus.DIRTY);
    },
    'click .red.right.corner.label' ()
    {
		Table.findOne({ _id: this._id }).updateTableStatus(TableStatus.CLEAN);
    },
    'click .green.right.corner.label' ()
    {
		Table.findOne({ _id: this._id }).updateTableStatus(TableStatus.TAKEN);
    },
});

Template.floorplan.helpers({
    tables()
    {
        return Tables.find({});
    },
});

Template.table.helpers({
    'isDirty': function() {
        if(this.table_status == 'Dirty') {
            return true;
        }
    },
    'isClean': function() {
        if(this.table_status == 'Clean') {
            return true;
        }
    },
    'isReserved': function() {
        if(this.table_status == 'Reserved') {
            return true;
        }
    },
    'isTaken': function() {
        if(this.table_status == 'Taken') {
            return true;
        }
    },
});