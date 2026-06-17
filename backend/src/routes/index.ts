import { Router } from 'express';
import * as productController from '../controllers/productController';
import * as memberController from '../controllers/memberController';
import * as orderController from '../controllers/orderController';
import * as tastingController from '../controllers/tastingController';
import * as reviewController from '../controllers/reviewController';
import * as adminController from '../controllers/adminController';
import { authenticateMember, authenticateAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.get('/products/:id/reviews', productController.getProductReviews);

router.post('/products', authenticateAdmin, productController.createProduct);
router.put('/products/:id', authenticateAdmin, productController.updateProduct);
router.patch('/products/:id/status', authenticateAdmin, productController.updateProductStatus);
router.delete('/products/:id', authenticateAdmin, productController.deleteProduct);

router.post('/auth/register', memberController.register);
router.post('/auth/login', memberController.login);
router.get('/member/profile', authenticateMember, memberController.getProfile);
router.put('/member/profile', authenticateMember, memberController.updateProfile);

router.get('/admin/members', authenticateAdmin, memberController.getMembers);
router.get('/admin/members/:id', authenticateAdmin, memberController.getMemberById);

router.post('/orders', authenticateMember, orderController.createOrder);
router.get('/orders/my', authenticateMember, orderController.getMyOrders);
router.get('/orders/:id', authenticateMember, orderController.getOrderById);
router.post('/orders/:id/pay', authenticateMember, orderController.payOrder);
router.post('/orders/:id/confirm', authenticateMember, orderController.confirmOrder);
router.post('/orders/:id/cancel', authenticateMember, orderController.cancelOrder);

router.get('/admin/orders', authenticateAdmin, orderController.getOrders);
router.put('/admin/orders/:id/status', authenticateAdmin, orderController.updateOrderStatus);

router.get('/tastings', tastingController.getEvents);
router.get('/tastings/:id', tastingController.getEventById);
router.post('/tastings/:eventId/register', authenticateMember, tastingController.registerEvent);
router.get('/tastings/registrations/my', authenticateMember, tastingController.getMyRegistrations);
router.post('/tastings/registrations/:id/cancel', authenticateMember, tastingController.cancelRegistration);

router.post('/tastings', authenticateAdmin, tastingController.createEvent);
router.put('/tastings/:id', authenticateAdmin, tastingController.updateEvent);
router.delete('/tastings/:id', authenticateAdmin, tastingController.deleteEvent);
router.get('/tastings/:eventId/registrations', authenticateAdmin, tastingController.getEventRegistrations);

router.post('/reviews', authenticateMember, reviewController.createReview);
router.get('/reviews/my', authenticateMember, reviewController.getMyReviews);

router.post('/admin/login', adminController.login);
router.get('/admin/profile', authenticateAdmin, adminController.getProfile);
router.post('/admin/upload/:type', authenticateAdmin, upload.single('file'), adminController.uploadImage);

export default router;
