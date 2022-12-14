import { DeleteOutlined } from '@ant-design/icons';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Progress, Rate } from 'antd';
import classNames from 'classnames/bind';
import dayjs from 'dayjs';
import parse from 'html-react-parser';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { authApi, bookApi, reviewApi, userApi } from '~/api/api';
import Popup from '../../components/Popup';
import styles from './BookShow.module.scss';

const cx = classNames.bind(styles);
const collectionMap = {
  wishlist: 'Dự định đọc',
  readingList: 'Đang đọc',
  readList: 'Đã đọc',
  droppedList: 'Ngừng đọc',
};

function BookShow() {
  const { id } = useParams();
  const [showPopup, setShowPopup] = useState(false);
  const [book, setBook] = useState({});
  const [user, setUser] = useState({});
  const [isBookExist, setIsBookExist] = useState(0);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    bookApi
      .getBook(id, token)
      .then((res) => {
        setBook(res.data.result);
        setIsBookExist(1);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        setIsBookExist(2);
      });
  }, [id]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      const email = JSON.parse(localStorage.getItem('user')).email;
      authApi.verify(email, token).then((res) => {
        if (res.data.code === 200) {
          setUser(res.data.result);
          setIsLogged(true);
        }
      });
    }
  }, []);

  const handleUpdateCollection = (collection) => {
    const token = Cookies.get('token');
    userApi.updateCollection(id, collection, token).then((res) => {
      if (res.data.code === 200) {
        setShowPopup(false);
        setBook({ ...book, userCollection: collection });
        toast.success('Cập nhật tủ sách thành công');
      }
    });
  };

  const handleRemoveFromCollection = () => {
    const token = Cookies.get('token');
    userApi.removeFromCollection(id, token).then((res) => {
      if (res.data.code === 200) {
        toast.success('Xóa khỏi tủ sách thành công');
        setBook({ ...book, userCollection: null });
        setShowPopup(false);
      }
    });
  };

  const handleRate = (value) => {
    const token = Cookies.get('token');
    const data = {
      bookId: id,
      rating: value,
    };
    reviewApi.rateBook(data, token).then((res) => {
      if (res.data.code === 200 || res.data.code === 201) {
        toast.success('Đánh giá thành công');
        setBook({ ...book, userReview: res.data.result });
      }
    });
  };

  if (isBookExist === 0) {
    return <div>Loading...</div>;
  }

  if (isBookExist === 2) {
    return <div>Book not found</div>;
  }

  return (
    <div className={cx('wrapper')}>
      <div className={cx('content')}>
        <div className={cx('column')}>
          <div className={cx('container')}>
            <aside className={cx('BookPage-LeftColumn')}>
              <div className={cx('BookCover')}>
                <img src={book.cover} alt="BP4" />
              </div>
              <div className={cx('ActionButton')}>
                {isLogged && (
                  <div className={cx('AddBtn')}>
                    {book.userCollection ? (
                      <button className={cx('Add')}>{collectionMap[book.userCollection]}</button>
                    ) : (
                      <button className={cx('Add')} onClick={() => handleUpdateCollection('wishlist')}>
                        Thêm vào tủ sách
                      </button>
                    )}
                    <button className={cx('Change-btn')} onClick={() => setShowPopup(true)}>
                      <FontAwesomeIcon icon={faAngleDown} />
                    </button>
                    <Popup trigger={showPopup} setTrigger={setShowPopup}>
                      <div className={cx('popup-content')}>
                        <h3>Chọn kệ tủ cho cuốn sách</h3>
                        <div className={cx('StepShelving')}>
                          {Object.keys(collectionMap).map((key, index) => (
                            <button
                              key={index}
                              className={(key === book.userCollection && cx('ButtonShelving')) || cx('ButtonShelving')}
                              onClick={() => handleUpdateCollection(key)}
                              disabled={key === book.userCollection}
                              id={index}
                            >
                              {collectionMap[key]}
                            </button>
                          ))}
                        </div>
                        <div className={cx('DeleteBtn')} onClick={handleRemoveFromCollection}>
                          <DeleteOutlined />
                          <div>Bỏ khỏi tủ sách</div>
                        </div>
                      </div>
                    </Popup>
                  </div>
                )}
                <div className={cx('BuyBtn')}>
                  <button className={cx('Add')}>Nơi bán</button>
                </div>
              </div>
            </aside>
            <section className={cx('BookPage-RightColumn')}>
              <h1 className={cx('Title')}>{book.title}</h1>
              <a className={cx('Author')} href="##">
                {book.author}
              </a>
              <a href="#Rtg" className={cx('textStats')}>
                <div id="RS" className={cx('RatingStats')}>
                  <div className={cx('Rating')}>
                    <Rate allowHalf disabled defaultValue={book.rating?.averageRating} style={{ fontSize: 36 }} />
                  </div>
                  <div>
                    <h1>{book.rating?.averageRating}</h1>
                  </div>
                  <div className={cx('Statistic')}>
                    <div>{book.rating?.ratingCount}</div>
                    <div className={cx('space')}>Đánh giá</div>
                  </div>
                  <div className={cx('Statistic')}>
                    <div>{book.rating?.reviewCount}</div>
                    <div className={cx('space')}>Cảm nhận</div>
                  </div>
                </div>
              </a>
              <div className={cx('Summary')}>{book.description ? parse(book.description) : 'Không có mô tả'}</div>
              <div className={cx('Info')}>
                <p className={cx('InfoTitle')}>Thể loại:</p>
                <p className={cx('InfoTag')}>
                  {book.tags?.map((tag) => (
                    <a href={`/genre/${tag.code}`} className={cx('Tag')} key={tag.id} style={{ padding: '0 5px' }}>
                      {tag.name}
                    </a>
                  ))}
                </p>
              </div>
              <br />
              <div className={cx('Info')}>
                <p className={cx('InfoTitle')}>Nhà xuất bản:</p>
                <p className={cx('InfoContent')}>{book?.publisher}</p>
              </div>
              <br />
              <div className={cx('Info')}>
                <p className={cx('InfoTitle')}>Ngày xuất bản:</p>
                <>{book?.publishDate}</>
              </div>
              <br />
              <div className={cx('Info')}>
                <p className={cx('InfoTitle')}>Số trang:</p>
                <p>{book?.pageCount}</p>
              </div>
              <br />
              <p className={cx('TieuDe')}>TỰA SÁCH CÙNG DANH MỤC</p>
              <hr></hr>
              <div className={cx('sameGenre')}>
                {book?.alikeBooks?.map((book, index) => (
                  <a href={`/book/${book.id}`} key={index}>
                    <img className={cx('imgProduct')} src={book.cover} alt="BP4" />
                  </a>
                ))}
              </div>

              <hr />

              <h2 className={cx('ratingTitle')}>Đánh giá và cảm nhận</h2>
              {isLogged && (
                <div className={cx('Mine')}>
                  <h3>Của tôi</h3>
                  <div className={cx('MyReviewCard')}>
                    <div className={cx('ReviewProfile')}>
                      <Avatar size={60} src={user?.avatar} />
                      <div>
                        <a className={cx('Name')} href="##">
                          {user?.name}
                        </a>
                      </div>
                      <div className={cx('ReviewInfo')}>
                        <div>{book.userReview?.userObj?.reviewCount}</div>
                        <div>
                          <p>đánh giá</p>
                        </div>
                      </div>
                    </div>
                    <div className={cx('WriteReview')}>
                      {book.userReview ? (
                        <>
                          <div className={cx('Rate')}>
                            <Rate
                              style={{ fontSize: 30 }}
                              defaultValue={book.userReview?.rating}
                              onChange={handleRate}
                            />
                            <p>Xếp hạng quyển sách này</p>
                          </div>
                          <a href={`/review/${book.id}/`} className={cx('WriteBtn')}>
                            <button className={cx('write')}>
                              {book.userReview?.content ? 'Sửa cảm nhận' : 'Viết cảm nhận'}
                            </button>
                          </a>
                        </>
                      ) : (
                        <>
                          <div className={cx('Rate')}>
                            <Rate style={{ fontSize: 30 }} defaultValue={0} onChange={handleRate} />
                            <p>Xếp hạng quyển sách này</p>
                            <a href={`/review/${book.id}/`} className={cx('WriteBtn')}>
                              <button className={cx('write')}>Viết cảm nhận</button>
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <hr />
              <div className={cx('Communicate')}>
                <h3>Đánh giá của cộng đồng</h3>
                <div id="Rtg" className={cx('ReviewsSectionStatistic')}>
                  <div className={cx('RatingStats')}>
                    <div className={cx('Rating')}>
                      <Rate allowHalf disabled defaultValue={book.rating?.averageRating} style={{ fontSize: 36 }} />
                    </div>
                    <div>
                      <h1>{book.rating?.averageRating}</h1>
                    </div>
                    <div className={cx('Statistic')}>
                      <div>{book.rating?.ratingCount}</div>
                      <div className={cx('space')}>Đánh giá</div>
                    </div>
                    <div className={cx('Statistic')}>
                      <div>{book.rating?.reviewCount}</div>
                      <div className={cx('space')}>Cảm nhận</div>
                    </div>
                  </div>
                </div>
                <div className={cx('HistogramBar')}>
                  <div className={cx('TitleStar')}>5 sao</div>
                  <div className={cx('ProgressBar')}>
                    <Progress
                      percent={
                        book.rating?.ratingCount > 0 ? (book.rating?.fiveStar / book.rating?.ratingCount) * 100 : 0
                      }
                      size="big"
                      status="active"
                      showInfo={false}
                      strokeColor={{ '0%': '#FADB14', '100%': '#FADB14' }}
                      strokeWidth={12}
                    />
                  </div>
                  <div className={cx('RatingHistogram')}>
                    {book.rating?.fiveStar} (
                    {`${book.rating?.ratingCount > 0 ? (book.rating?.fiveStar / book.rating?.ratingCount) * 100 : 0}%`})
                  </div>
                </div>
                <div className={cx('HistogramBar')}>
                  <div className={cx('TitleStar')}>4 sao</div>
                  <div className={cx('ProgressBar')}>
                    <Progress
                      percent={
                        book.rating?.ratingCount > 0 ? (book.rating?.fourStar / book.rating?.ratingCount) * 100 : 0
                      }
                      size="big"
                      status="active"
                      showInfo={false}
                      strokeColor={{ '0%': '#FADB14', '100%': '#FADB14' }}
                      strokeWidth={12}
                    />
                  </div>
                  <div className={cx('RatingHistogram')}>
                    {book.rating?.fourStar} (
                    {`${book.rating?.ratingCount > 0 ? (book.rating?.fourStar / book.rating?.ratingCount) * 100 : 0}%`})
                  </div>
                </div>
                <div className={cx('HistogramBar')}>
                  <div className={cx('TitleStar')}>3 sao</div>
                  <div className={cx('ProgressBar')}>
                    <Progress
                      percent={
                        book.rating?.ratingCount > 0 ? (book.rating?.threeStar / book.rating?.ratingCount) * 100 : 0
                      }
                      size="big"
                      status="active"
                      showInfo={false}
                      strokeColor={{ '0%': '#FADB14', '100%': '#FADB14' }}
                      strokeWidth={12}
                    />
                  </div>
                  <div className={cx('RatingHistogram')}>
                    {book.rating?.threeStar} (
                    {`${book.rating?.ratingCount > 0 ? (book.rating?.threeStar / book.rating?.ratingCount) * 100 : 0}%`}
                    )
                  </div>
                </div>
                <div className={cx('HistogramBar')}>
                  <div className={cx('TitleStar')}>2 sao</div>
                  <div className={cx('ProgressBar')}>
                    <Progress
                      percent={
                        book.rating?.ratingCount > 0 ? (book.rating?.twoStar / book.rating?.ratingCount) * 100 : 0
                      }
                      size="big"
                      status="active"
                      showInfo={false}
                      strokeColor={{ '0%': '#FADB14', '100%': '#FADB14' }}
                      strokeWidth={12}
                    />
                  </div>
                  <div className={cx('RatingHistogram')}>
                    {book.rating?.twoStar} (
                    {`${book.rating?.ratingCount > 0 ? (book.rating?.twoStar / book.rating?.ratingCount) * 100 : 0}%`})
                  </div>
                </div>
                <div className={cx('HistogramBar')}>
                  <div className={cx('TitleStar')}>1 sao</div>
                  <div className={cx('ProgressBar')}>
                    <Progress
                      percent={
                        book.rating?.ratingCount > 0 ? (book.rating?.oneStar / book.rating?.ratingCount) * 100 : 0
                      }
                      size="big"
                      status="active"
                      showInfo={false}
                      strokeColor={{ '0%': '#FADB14', '100%': '#FADB14' }}
                      strokeWidth={12}
                    />
                  </div>
                  <div className={cx('RatingHistogram')}>
                    {book.rating?.oneStar} (
                    {`${book.rating?.ratingCount > 0 ? (book.rating?.oneStar / book.rating?.ratingCount) * 100 : 0}%`})
                  </div>
                </div>
              </div>
              {book.reviews?.length > 0 &&
                book.reviews.map((review, index) => (
                  <div className={cx('ReviewList')} key={index}>
                    <div className={cx('ReviewerProfile')}>
                      <div className={cx('ReviewProfile')}>
                        <Avatar size={60} src={review.userObj?.avatar} />
                        <div>
                          <a className={cx('Name')} href="##">
                            {review.userObj?.name}
                          </a>
                        </div>
                        <div className={cx('ReviewInfo')}>
                          <div>{review.userObj?.reviewCount}</div>
                          <div>
                            <p>đánh giá</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={cx('ReviewCardContent')}>
                      <div className={cx('ReviewCard_Row')}>
                        <div className={cx('ShelfStatus')}>
                          <Rate disabled defaultValue={review.rating} />
                        </div>
                        <div className={cx('TextDate')}>{dayjs(review.createdAt).format('DD/MM/YYYY')}</div>
                      </div>
                      <div className={cx('TruncatedContent')}>
                        <div className={cx('CommentText')}>
                          <p>{review.content}</p>
                        </div>
                      </div>
                      {/* <div className={cx('SocialFooter_statsContainer')}>
                        <div className={cx('LabelItemDT')}>
                          114<span>Đồng tình</span>
                        </div>
                        <div className={cx('LabelItemKDT')}>
                          10<span>Không đồng tình</span>
                        </div>
                      </div>
                      <div className={cx('SocialFooter_actionsContainer')}>
                        <div className={cx('ActionItemDT')}>
                          <LikeOutlined />
                          <span>Đồng tình</span>
                        </div>
                        <div className={cx('ActionItemKDT')}>
                          <DislikeOutlined />
                          <span>Không đồng tình</span>
                        </div>
                      </div> */}
                      <hr />
                    </div>
                  </div>
                ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookShow;
