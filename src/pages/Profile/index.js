import classNames from 'classnames/bind';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { userApi } from '~/api/api';
import { DateConverter, isObjectEmpty } from '~/helper/helper';
import styles from './Profile.module.scss';

const cx = classNames.bind(styles);
const collectionMap = {
  wishlist: 'Dự định đọc',
  readingList: 'Đang đọc',
  readList: 'Đã đọc',
  droppedList: 'Ngừng đọc',
};
const genderMap ={
  male: 'Nam',
  female:'Nữ',
  unknown:'Chúa biết',
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    if (Cookies.get('token') && localStorage.getItem('user')) {
      userApi
        .getSelf(Cookies.get('token'))
        .then((response) => {
          if (response?.data.code === 200) {
            setUser(response.data.result);
          }
        })
        .catch((error) => {
          const msg = error.response.data.message ? error.response.data.message : 'Verify Failed';
          toast.error(msg);
          Cookies.remove('token');
          localStorage.removeItem('user');
          navigate('/login');
        });
    }
  }, [navigate]);

  return (
    <div>
      <div className={cx('wrapper')}>
        <div className={cx('container')}>
          <h2 className={cx('title')}>Hồ sơ thành viên</h2>
          <a href="accountsetting">Chỉnh sửa hồ sơ</a>
        </div>
        <div className={cx('content')}>
          <div className={cx('profile')}>
            <div className={cx('top')}>
              <div className={cx('left')}>
                <div>
                  <img src={user.avatar} alt="" />
                </div>
                <div>
                  {user.commentCount}<span> bình luận</span>
                </div>
              </div>
              <div className={cx('right')}>
                <div className={cx('userName')}>{user?.name}</div>

                <div className={cx('sex')}>
                  Giới tính:{' '}
                  <span>{genderMap[user.gender]}</span>
                </div>

                <div className={cx('dob')}>
                  Ngày sinh:{' '}
                  <span>{user.dateOfBirth ? DateConverter(user.dateOfBirth).dateOnly : 'Chưa cập nhật'}</span>
                </div>

                <div className={cx('phonenumber')}>
                  Số điện thoại:{' '}
                  <span>{user.phoneNumber ? user.phoneNumber : 'Chưa cập nhật'}</span>
                </div>

                <div className={cx('aboutMe')}>
                  Về tôi: {'  '}
                  <span>{user.bio ? user.bio : 'Chưa cập nhật'}</span>
                </div>
              </div>
            </div>
            <hr />
            <div className={cx('bot')}>
              <div className={cx('Tit')}>Tủ sách của tôi</div>
              <div className={cx('shelf')}>
                {!isObjectEmpty(user) &&
                  Object.keys(user?.collectionCount).map((key, index) => (
                    // <a href={`${user.id}/collection/${key}`} key={index}>
                    <a href={`/mybook/${key}`} key={index}>
                      {collectionMap[key]}
                      <span>({user.collectionCount[key]})</span>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
