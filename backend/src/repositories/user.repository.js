const prisma = require('../config/db');

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function create({ email, password, role, name, phone }) {
  return prisma.user.create({
    data: { email, password, role, name, phone },
  });
}

async function updatePassword(id, password) {
  return prisma.user.update({ where: { id }, data: { password } });
}

async function setActive(id, isActive) {
  return prisma.user.update({ where: { id }, data: { isActive } });
}

module.exports = {
  findByEmail,
  findById,
  create,
  updatePassword,
  setActive,
};
