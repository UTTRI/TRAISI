﻿// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Repositories;
using DAL.Repositories.Interfaces;

namespace DAL
{
    public class UnitOfWork : IUnitOfWork
    {
        readonly ApplicationDbContext _context;

        ICustomerRepository _customers;
        ISurveyRepository _surveys;
        IProductRepository _products;
        IOrdersRepository _orders;
        IUserGroupRepository _userGroups;
        IGroupMemberRepository _groupMembers;

        IQuestionPartRepository _questionParts;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }



        public ICustomerRepository Customers
        {
            get
            {
                if (_customers == null)
                    _customers = new CustomerRepository(_context);

                return _customers;
            }
        }

        public ISurveyRepository Surveys
        {
            get
            {
                if (_surveys == null)
                    _surveys = new SurveyRepository(_context);

                return _surveys;
            }
        }



        public IProductRepository Products
        {
            get
            {
                if (_products == null)
                    _products = new ProductRepository(_context);

                return _products;
            }
        }



        public IOrdersRepository Orders
        {
            get
            {
                if (_orders == null)
                    _orders = new OrdersRepository(_context);

                return _orders;
            }
        }

        public IGroupMemberRepository GroupMembers
        {
            get
            {
                if (_groupMembers == null)
                    _groupMembers = new GroupMemberRepository(_context);

                return _groupMembers;
            }
        }

        public IUserGroupRepository UserGroups
        {
            get
            {
                if (_userGroups == null)
                    _userGroups = new UserGroupRepository(_context);

                return _userGroups;
            }
        }

        public IQuestionPartRepository IQuestionPartRepository
        {
            get
            {
                if(_questionParts == null)
                {
                    _questionParts = new QuestionPartRepository(_context);
                }

                return _questionParts;
            }
        }

        public int SaveChanges()
        {
            return _context.SaveChanges();
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
