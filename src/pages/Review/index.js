import { Button, Input, Rate, Select } from 'antd';
import classNames from 'classnames/bind';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { reviewApi, userApi } from '~/api/api';
import styles from './Review.module.scss';

const cx = classNames.bind(styles);

export default function Review() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { Option } = Select;
  const { TextArea } = Input;

  const [review, setReview] = useState('');
  const [book, setBook] = useState({});
  // const [user, setUser] = useState({});
  const [rating, setRating] = useState(0);
  const [currentCollection, setCurrentCollection] = useState('');
  const [collection, setCollection] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token && id) {
      reviewApi
        .getReview(id, token)
        .then((response) => {
          if (response?.data.code === 200) {
            const result = response.data.result;
            // setUser(result.user);
            setBook(result.book);
            setCollection(result.book.collection ? result.book.collection : '');
            setCurrentCollection(result.book.collection ? result.book.collection : '');
            if (result.review) {
              setReview(result.review.id);
              setRating(result.review.rating);
              setContent(result.review.content);
            }
          }
        })
        .catch((error) => {
          const msg = error.response.data.message ? error.response.data.message : 'Verify Failed';
          toast.error(msg);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async () => {
    const token = Cookies.get('token');

    if (currentCollection !== collection) {
      const res = await userApi.updateCollection(id, collection, token);
      if (res?.data.code === 200) {
        toast.success('C???p nh???t t??? s??ch th??nh c??ng');
      } else {
        toast.error('C???p nh???t t??? s??ch th???t b???i');
      }
    }

    if (!review) {
      const data = {
        bookId: id,
        rating,
        content,
      };

      reviewApi
        .createReview(data, token)
        .then((response) => {
          if (response?.data.code === 200) {
            toast.success('????nh gi?? th??nh c??ng');
            navigate(`/book/${id}`);
          }
        })
        .catch((error) => {
          const msg = error.response.data.message ? error.response.data.message : 'Verify Failed';
          toast.error(msg);
        });
    } else {
      const data = {
        reviewId: review,
        rating,
        content,
      };

      reviewApi
        .updateReview(data, token)
        .then((response) => {
          if (response?.data.code === 200) {
            toast.success('C???p nh???t ????nh gi?? th??nh c??ng');
            navigate(`/book/${id}`);
          }
        })
        .catch((error) => {
          const msg = error.response.data.message ? error.response.data.message : 'Verify Failed';
          toast.error(msg);
        });
    }
  };

  if (loading) {
    return <div className={cx('loading')}>Loading...</div>;
  } else
    return (
      <>
        <div className={cx('wrapper')}>
          <div className={cx('bookinfo')}>
            <div className={cx('cover')}>
              <img src={book.cover} alt="" />
            </div>
            <div className={cx('info')}>
              <div>
                <div className={cx('title')}>{book.title}</div>
                <div className={cx('author')}>
                  <span>b???i </span>
                  {book.author}
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className={cx('rating')}>
            <div className={cx('rate')}>
              <div className={cx('name')}>????nh gi??: </div>
              <Rate allowHalf defaultValue={rating} onChange={(value) => setRating(value)} />
            </div>
            <div className={cx('collection')}>
              <div className={cx('name')}>T??? s??ch: </div>
              <Select
                placeholder="Ch???n t??? s??ch"
                style={{ width: 200 }}
                value={collection}
                onChange={(value) => setCollection(value)}
              >
                <Option value="wishlist">D??? ?????nh ?????c</Option>
                <Option value="readingList">??ang ?????c</Option>
                <Option value="readList">???? ?????c</Option>
                <Option value="droppedList">Ng??ng ?????c</Option>
              </Select>
            </div>
            <div className={cx('review')}>
              <div className={cx('name')}>????nh gi??: </div>
              <TextArea
                placeholder="Nh???p c???m nh???n c???a b???n v??o ????y"
                style={{
                  height: 200,
                  marginBottom: 24,
                }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className={cx('post')}>
              <Button type="primary" onClick={handleSubmit}>
                ????ng
              </Button>
            </div>
          </div>
        </div>
      </>
    );
}
