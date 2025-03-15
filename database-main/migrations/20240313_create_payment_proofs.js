exports.up = function(knex) {
  return knex.schema.createTable('payment_proofs', function(table) {
    table.increments('id').primary();
    table.string('user_id').nullable();
    table.string('store_type').notNullable(); // 'fortnite', 'roblox', 'supercell', etc.
    table.string('product_id').notNullable();
    table.string('product_name').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('proof_image_url').notNullable();
    table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending');
    table.text('admin_notes');
    table.string('nickname').nullable(); // Campo para el nickname del juego
    table.string('game_account_id').nullable(); // Campo para el ID de la cuenta del juego
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payment_proofs');
}; 