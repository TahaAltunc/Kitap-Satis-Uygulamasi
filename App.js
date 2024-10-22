import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert, 
} from 'react-native';

const API_KEY = 'uQnGj2fFg04aK5HHhpw5lYfUVABGAypZ';
const API_URL = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${API_KEY}`;

const App = () => {
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState({});
  const [isDiscountEnabled, setIsDiscountEnabled] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const formattedBooks = data.results.books.map(book => ({
        id: book.primary_isbn13,
        title: book.title,
        author: book.author,
        price: (Math.random() * (30 - 15) + 15).toFixed(2),
        image: book.book_image,
      }));
      setBooks(formattedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Sepeti temizleme fonksiyonu
  const clearCart = () => {
    Alert.alert(
      "Sepeti Temizle",
      "Sepetteki tüm ürünler silinecek. Emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Temizle",
          onPress: () => {
            setCart({});
            // İsteğe bağlı olarak bir bildirim gösterebiliriz
            Alert.alert("Başarılı", "Sepetiniz temizlendi!");
          },
          style: "destructive"
        }
      ]
    );
  };

  const updateQuantity = (bookId, increment) => {
    setCart(prevCart => {
      const currentQuantity = prevCart[bookId]?.quantity || 0;
      const newQuantity = increment 
        ? currentQuantity + 1 
        : Math.max(0, currentQuantity - 1);

      if (newQuantity === 0) {
        const { [bookId]: _, ...remainingCart } = prevCart;
        return remainingCart;
      }

      return {
        ...prevCart,
        [bookId]: {
          ...prevCart[bookId],
          quantity: newQuantity,
        }
      };
    });
  };

  const addToCart = (book) => {
    setCart(prevCart => ({
      ...prevCart,
      [book.id]: {
        book,
        quantity: 1,
      }
    }));
  };

  const getTotal = () => {
    const total = Object.values(cart).reduce((sum, item) => {
      return sum + (parseFloat(item.book.price) * item.quantity);
    }, 0);
    return isDiscountEnabled ? total * 0.9 : total;
  };

  const renderBookItem = ({ item }) => {
    const cartItem = cart[item.id];
    const quantity = cartItem?.quantity || 0;

    return (
      <View style={styles.bookItem}>
        <Image source={{ uri: item.image }} style={styles.bookImage} />
        <View style={styles.bookInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.author}>{item.author}</Text>
          <Text style={styles.price}>${item.price}</Text>
          
          {quantity > 0 ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, false)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, true)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.buttonText}>Sepete Ekle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Sepet boş mu kontrolü
  const isCartEmpty = Object.keys(cart).length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Çok Satan Kitaplarımız</Text>
      </View>
      
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={item => item.id}
      />
      
      <View style={styles.cartContainer}>
        <View style={styles.cartHeader}>
          <View style={styles.discountContainer}>
            <Text>%10 İndirim</Text>
            <Switch
              value={isDiscountEnabled}
              onValueChange={setIsDiscountEnabled}
            />
          </View>
          {!isCartEmpty && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearCart}
            >
              <Text style={styles.clearButtonText}>Sepeti Temizle</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Toplam: ${getTotal().toFixed(2)}
          </Text>
          {!isCartEmpty && (
            <Text style={styles.itemCount}>
              {Object.values(cart).reduce((sum, item) => sum + item.quantity, 0)} ürün
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#8ac7ea',
    borderBottomWidth: 1,
    borderBottomColor: '#3cb649',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  bookItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bookImage: {
    width: 100,
    height: 150,
    resizeMode: 'cover',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginTop: 8,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: '#3498db',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cartContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  discountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default App;