import {
  CheckCircleOutlined,
  ExclamationCircleFilled,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Button, Modal, Pagination, Tag } from 'antd';
import classNames from 'classnames/bind';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '~/api/api';
import { DateConverter } from '~/helper/helper';
import styles from './UserManagementMod.module.scss';

const cx = classNames.bind(styles);
const genderMap = {
  male: 'Nam',
  female: 'Nữ',
  unknown: 'Không rõ',
};
const token = Cookies.get('token');

export default function UserManagementMod() {
  const { confirm } = Modal;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [displayUsers, setDisplayUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState('');

  useEffect(() => {
    adminApi
      .getAllUsers(token)
      .then((res) => {
        if (res.data.result) {
          setUsers(res.data.result);
          setFilteredUsers(res.data.result);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    filteredUsers && setDisplayUsers(filteredUsers.slice((page - 1) * pageSize, page * pageSize));
  }, [filteredUsers, page, pageSize]);

  useEffect(() => {
    if (users.length > 0)
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name?.includes(query) ||
            user.email?.includes(query) ||
            user.phoneNumber?.includes(query) ||
            user.dateOfBirth?.includes(query) ||
            genderMap[user.gender].includes(query),
        ),
      );
  }, [users, query]);

  const showDisableConfirm = (user) => {
    confirm({
      title: 'Bạn có muốn cấm người dùng này không?',
      icon: <ExclamationCircleFilled />,
      content: 'Nhấn "Ok" để khoá quyền hạn người dùng ',
      onOk() {
        adminApi
          .disableUser(user.id, token)
          .then((res) => {
            if (res.data.code === 200) {
              // const index = users.findIndex((userElement) => userElement.id === user.id);
              const newUsers = users.map((userElement) => (userElement.id === user.id ? res.data.result : userElement));
              console.log(newUsers);
              setUsers(newUsers);
              return toast.success(res.data.message);
            } else return toast.error('Đã có lỗi xảy ra');
          })
          .catch((err) => {
            const msg = err.response.data.message ? err.response.data.message : 'Đã có lỗi xảy ra';
            return toast.error(msg);
          });
      },
      onCancel() {},
    });
  };

  const showEnableConfirm = (user) => {
    confirm({
      title: 'Bạn có muốn bỏ cấm người dùng này không?',
      icon: <ExclamationCircleFilled />,
      content: 'Nhấn "Ok" để khôi phục quyền hạn người dùng',
      onOk() {
        adminApi
          .enableUser(user.id, token)
          .then((res) => {
            if (res.data.code === 200) {
              // const index = users.findIndex((userElement) => userElement.id === user.id);
              const newUsers = users.map((userElement) => (userElement.id === user.id ? res.data.result : userElement));
              setUsers(newUsers);
              return toast.success(res.data.message);
            } else return toast.error('Đã có lỗi xảy ra');
          })
          .catch((err) => {
            const msg = err.response.data.message ? err.response.data.message : 'Đã có lỗi xảy ra';
            return toast.error(msg);
          });
      },
      onCancel() {},
    });
  };

  if (!users.length > 0) return <div>Loading...</div>;

  return (
    <>
      <div className={cx('usermanagement')}>
        <div className={cx('title')}>Người dùng</div>
        <div className={cx('tab')}>
          <div className={cx('titles')}>
            <p>Quản lý tài khoản người dùng</p>
          </div>
          <div className={cx('search')}>
          <form onSubmit={(e) => e.preventDefault()} role="search">
              <label htmlFor="search">Tìm kiếm</label>
              <input
                id="search"
                type="search"
                placeholder="Nhập vào đây..."
                autoFocus
                required
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit">
                <SearchOutlined style={{ fontSize: '16px', color: '#fff' }} />
              </button>
            </form>
          </div>
          <table className={cx('userList')}>
          <thead>
              <tr>
                <th width="15%">Tên</th>
                <th width="20%">Email</th>
                <th width="14%">Số điện thoại</th>
                <th width="11%">Giới tính</th>
                <th width="15%">Ngày sinh</th>
                <th width="15%">Trạng thái</th>
                <th width="10%">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers?.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{genderMap[user.gender]}</td>
                  <td>{user.dateOfBirth && DateConverter(user.dateOfBirth).dateOnly}</td>
                  <td>
                    <Tag color={user.accountStatus.status === 'active' ? 'green' : 'red'}>
                      {user.accountStatus.status === 'active' ? 'Đang hoạt động' : 'Dừng hoạt động'}
                    </Tag>
                  </td>
                  <td className={cx('centerAlign')}>
                    <div>
                      <Button
                        onClick={() =>
                          user.accountStatus.status === 'active' ? showDisableConfirm(user) : showEnableConfirm(user)
                        }
                        type="link"
                        icon={user.accountStatus.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
                        danger={user.accountStatus.status === 'active'}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={cx('pagin')}>
          <Pagination
              total={users?.length}
              defaultCurrent={page}
              defaultPageSize={pageSize}
              onChange={(value) => setPage(value)}
              pageSizeOptions={[10, 20, 50]}
              onShowSizeChange={(current, size) => setPageSize(size)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
