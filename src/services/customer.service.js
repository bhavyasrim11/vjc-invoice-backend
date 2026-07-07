const customerRepository = require('../repositories/customer.repository');
const { generateCustomerId } = require('../models/customer');

const customerService = {

  getAllCustomers: async (filters) => {
    const customers = await customerRepository.getAll(filters);
    const stats = await customerRepository.getStats(filters.role, filters.userId);
    return { customers, stats };
  },

  getCustomerById: async (id) => {
    const customer = await customerRepository.getById(id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  },

  createCustomer: async (data) => {
    // Check duplicate email
    const existing = await customerRepository.getAll({
  search: data.email,
  role: 'chairman',  // ← always check all customers for duplicate email
  userId: null,
});

const emailExists = existing.find(c => c.email === data.email);
    if (emailExists) throw new Error('Email already exists');

    // Auto-generate customer_id (employee-wise)
const customer_id = await generateCustomerId(data.created_by);
return await customerRepository.create({ ...data, customer_id });
  },

  updateCustomer: async (id, data) => {
    const customer = await customerRepository.getById(id);
    if (!customer) throw new Error('Customer not found');
    return await customerRepository.update(id, data);
  },

  deleteCustomer: async (id) => {
    const customer = await customerRepository.getById(id);
    if (!customer) throw new Error('Customer not found');
    return await customerRepository.delete(id);
  }
};

module.exports = customerService;