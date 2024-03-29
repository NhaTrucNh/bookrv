import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { categoryApi } from '~/api/api';
import styles from './Genres.module.scss';
import {RightOutlined} from '@ant-design/icons';

const cx = classNames.bind(styles);

export default function Genres() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.getAll().then((res) => {
      setCategories(res.data.result);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container')}>
        <div className={cx('GenreBar')}>
          <p className={cx('title')}>Thể loại</p>
          <ul className={cx('list')}>
            {categories.map((category, index) => (
              <li key={index}>
                <div><a href={`/genre/${category.tag?.code}`}>{category.tag?.name}</a></div>
              </li>
            ))}
          </ul>
        </div>

        {categories.map((category, index) => (
          <div className={cx('GenreBook')} >
            <div key={index}>
              <p className={cx('title')}>
                <a href={`/genre/${category.tag?.code}`}>{category.tag?.name}</a>
              </p>
              <div className={cx('lBook')}>
                {category.books?.map((book, index) => (
                  <a href={`/book/${book.id}`} key={index}>
                    <img
                      src={book.cover}
                      alt="cover"
                    />
                  </a>
                ))}
              </div>
              <div className={cx('readmore')}>
                <a href={`/genre/${category.tag?.code}`}><span>Xem thêm <RightOutlined style={{fontSize: '10px'}} /></span></a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
